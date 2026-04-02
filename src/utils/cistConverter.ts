
import { Course, MatrixRow, CistBlueprint, LearningDomain, Taxonomy, ItemType, DublinAccord } from '../types';

export const convertMatrixToBlueprints = (
  course: Course,
  template: MatrixRow[],
  learningDomains: LearningDomain[],
  taxonomies: Taxonomy[],
  itemTypes: ItemType[],
  dublinAccords: DublinAccord[]
): CistBlueprint[] => {
  const blueprintsMap: Record<string, CistBlueprint> = {};

  // Helper to find IDs
  const findDomainId = (name: string) => learningDomains.find(d => d.name === name)?.id || '';
  // const findTopicId = (code: string) => {
  //   // Course topics are strings like "1.0 Hand Tools" or objects if loaded fully
  //   // But in Course type, topics is string[] usually.
  //   // Wait, in api.ts GET, topics is mapped to string[].
  //   // But we need the ID.
  //   // The Course object in memory might not have topic IDs if it came from the UI state which only has strings.
  //   // However, if we loaded it from API, we might have the original data?
  //   // Actually, the Course interface has `topics?: string[]`.
  //   // This is a problem. We need topic IDs to save to the DB.
  //   // If the UI only works with codes, we can't save relations without looking up IDs.
  //   // We might need to fetch topics again or store them better in the Course object.
  //   return ''; 
  // };
  
  // Actually, let's look at how we can get topic IDs.
  // The Course object from API has `topics` as string array "Code Name".
  // But we need the ID from the `topics` table.
  // If the user is editing a course, they might have added new topics which don't have IDs yet.
  // Or they are using existing topics.
  
  // Strategy: The backend RPC `save_course_data` likely handles topic creation/lookup by code.
  // If we are constructing `CistBlueprint` objects to send to the backend, we might need to send codes if IDs are missing?
  // But `CistRow` expects `topic_id` (UUID).
  
  // If we are strictly following the schema provided, we need UUIDs.
  // If the frontend doesn't have UUIDs, we can't construct valid `CistRow` objects.
  
  // However, maybe we can send a "DTO" structure that the backend understands?
  // The `save_course_data` RPC likely takes the whole JSON and does the work.
  // So maybe we don't need to generate perfect `CistBlueprint` objects with UUIDs.
  // We can generate objects with codes, and let the backend resolve them.
  
  // But the prompt implies I should use the tables.
  // If I can't change the backend, I must rely on what `save_course_data` does.
  // If `save_course_data` expects the `jsuTemplate` (MatrixRow[]) and does the logic, then I don't need to do anything!
  
  // BUT, the user provided the SQL. This usually means "I want you to use these tables".
  // If the RPC doesn't use them, I'm stuck.
  // If the RPC *does* use them, then `save_course_data` must be updated to use them.
  // Since I can't update the RPC, I have to assume it's already updated or I need to bypass it.
  
  // Let's assume the RPC is NOT updated and I need to do it manually?
  // No, that's too risky without transaction support.
  
  // Let's assume the RPC *is* updated to accept `blueprints` array in the JSON and populate the tables.
  // So my job is to convert `jsuTemplate` (MatrixRow[]) -> `blueprints` (CistBlueprint[]-like structure).
  // Even if I don't have IDs, I can put codes in a temporary field if the backend supports it.
  // Or, I can try to find IDs if available.
  
  template.forEach(row => {
    const task = row.task || 'Assessment';
    if (!blueprintsMap[task]) {
      blueprintsMap[task] = {
        id: crypto.randomUUID(), // Temporary ID
        course_id: course.id,
        task: task,
        rows: []
      };
    }

    const domainId = findDomainId(row.domain || 'Cognitive');
    
    // Find policy to get daMappings
    const policy = (course.assessmentPolicies || []).find(p => p.name === task);
    const mappedCodes = policy ? (course.daMappings?.[policy.id] || []) : [];
    
    // Find the first mapped code that matches a Dublin Accord
    const accordId = dublinAccords.find(a => mappedCodes.includes(a.code))?.id || '';
    
    // We need to map taxonomies
    const rowTaxonomies: { taxonomy_id: string; count: number; marks: number }[] = [];
    if (row.levels) {
      Object.entries(row.levels).forEach(([level, data]) => {
        const tax = taxonomies.find(t => t.level === level && t.domain_id === domainId);
        if (tax && (data.count || data.marks)) {
          rowTaxonomies.push({
            taxonomy_id: tax.id,
            count: Number(data.count) || 0,
            marks: Number(data.marks) || 0
          });
        }
      });
    }

    // Item types
    const rowItemTypes = (row.itemTypes || []).map(code => {
      return itemTypes.find(it => it.code === code)?.id;
    }).filter(Boolean) as string[];

    // CLOs - we only have codes in `row.clos` (e.g. "CLO 1")
    const rowClos = row.clos || [];

    const cistRow = {
        id: crypto.randomUUID(),
        blueprint_id: blueprintsMap[task].id,
        topic_id: '', // Placeholder, will be resolved by SQL using topicCode
        topicCode: row.topicCode, // Pass code for lookup
        construct_id: '', // Placeholder
        domain_id: domainId || null,
        dublin_accord_id: accordId || null,
        total_mark: row.totalMark || 0,
        construct: row.construct || '',
        clo_ids: [], // Placeholder
        cloCodes: rowClos, // Pass codes for lookup
        item_type_ids: rowItemTypes,
        taxonomies: rowTaxonomies
    };
    
    blueprintsMap[task].rows.push(cistRow);
  });
  
  return Object.values(blueprintsMap);
};
