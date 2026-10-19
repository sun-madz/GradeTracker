// Taylor's Curriculum Framework – flexible education options.
// Source: Taylor's University "Flexible Education Guide" (2026 intakes) and the Flexible Study Components page.
// Earlier intakes may differ slightly – check the Programme Guide on the Student Portal.

export const FEG_SOURCE = 'https://university.taylors.edu.my/en/discover-us/taylorsphere/taylors-curriculum-framework/flexible-study-components.html';

export interface Package { name: string; modules: string[]; pick: number; note?: string }

// Each extension = 5 modules (20 credits). Only the packages open to Computer Science are listed.
export const EXTENSION_PACKAGES: Package[] = [
  { name: 'Artificial Intelligence', pick: 5, modules: ['Computer Vision and Natural Language Processing', 'Cognitive Computing and Applications', 'Data Analytics and Machine Learning', 'Data Visualisation', 'Data Science Principles'] },
  { name: 'Business Intelligence and Analytics', pick: 5, modules: ['Social Media Analytics', 'Market Intelligence and Data Visualisation', 'Marketing Analytics', 'Data Mining', 'Data Science Principles'] },
  { name: 'Cyber Security', pick: 5, modules: ['Wireless Networks and Security', 'Computer and Network Security', 'Computer Intrusion Detection', 'Computer Crime and Digital Evidence', 'Secured Software Systems', 'Cognitive Computing and Applications'] },
  { name: 'Data Science', pick: 5, modules: ['Statistical Inference and Modelling', 'Data Science Principles', 'Data Mining', 'Big Data Technologies', 'Data Visualisation', 'Internet of Things'] },
  { name: 'Digital Transformation', pick: 5, modules: ['Environmental, Social, and Governance (ESG) Principles and Practices', 'Digital Transformation', 'Artificial Intelligence (AI) - Enabled Enterprise Automation', 'Machine Learning and Intelligent System', 'Interactive and Digital Marketing'] },
  { name: 'Internet Technologies', pick: 5, modules: ['Internet of Things', 'Mobile Applications Development', 'Wireless Networks and Security', 'Introduction to Cloud Computing', 'Computer and Network Security'] },
  { name: 'Mobile Computing', pick: 5, modules: ['Secured Software Systems', 'Introduction to Mobile Computing', 'Mobile Applications Development', 'Wireless Networks and Security', 'Internet of Things', 'Introduction to Cloud Computing'] },
];

// Each minor = 5 modules (20 credits) outside your discipline.
// Minors closed to Computer Science students (Business Analytics, Mobile Technology, Web Technology, Event Management)
// and those limited to other schools (e.g. Cosmetic Science, Design and Manufacturing, Pharmaceutical) are left out.
const c5 = 'Some modules may be compulsory. Check your Programme Guide.';
export const MINOR_PACKAGES: Package[] = [
  { name: 'Accounting', pick: 5, note: c5, modules: ['Introduction to Accounting', 'Financial Reporting', 'Malaysian Taxation', 'Management Accounting', 'Accounting Information Systems', 'Ethics and Corporate Governance', 'Contemporary Public Accounting and International Finance'] },
  { name: 'Advertising and Brand Management', pick: 5, note: 'Introduction to Mass Communication is compulsory for non-Communication students.', modules: ['Introduction to Mass Communication', 'Advertising Fundamentals', 'Strategic Copywriting', 'Creative Design for Advertising', 'Corporate Identity and Branding Design', 'Brand Management'] },
  { name: 'Creative Media Design', pick: 5, modules: ['Typography', 'Digital Photography and Imaging', 'Illustration and Visual Narrative', 'Design Principles', 'Intercultural Design', 'Information Design', 'Interactive Design', 'Advanced Typography', 'Video and Sound Production', 'Animation Fundamentals', 'Anatomy and Character Sculpture', 'Brand Corporate Identity'] },
  { name: 'Culinary Arts', pick: 5, note: 'Needs chef uniform, knife set and typhoid vaccination.', modules: ['Food Safety and Sanitation', 'Principles of Culinary', 'Principles of Pastry and Baking', 'Food Business Management', 'Food Media', 'Food Sociology', 'Food Trends and Products Innovation'] },
  { name: 'Culinary Science', pick: 5, modules: ['Food Safety and Sanitation', 'Principles of Organic Chemistry', 'Applied Food Microbiology', 'Food Packaging and Labelling', 'Aromatic Ingredients & Flavour Application', 'Principles of Culinary', 'Principles of Pastry and Baking', 'Sensory Evaluation of Food'] },
  { name: 'Digital Media Production', pick: 5, modules: ['Trends in New Media', 'Film Studies', 'Narrative Writing', 'Digital Moving Image', 'Digital Animation and Compositing'] },
  { name: 'Early Childhood Education', pick: 5, modules: ["Promoting Children's Wellbeing", 'Early Science and Numeracy', 'Literacy and Language Development', 'Managing Behaviour and Safety', 'Advancing Play and Learning', 'Inclusive Education'] },
  { name: 'Education', pick: 5, modules: ['Philosophy and Curriculum Design', 'Teaching and Managing Diverse Learners in the Classroom', 'Learning, Assessment and Feedback', 'Education, School and Society', 'New Pedagogies - Digital Tools and Resources', 'Teaching Language Arts', 'Teaching Primary School English Language', 'Language Use and Society', 'Number & Algebra', 'Measurement & Geometry', 'Statistics', 'Science - Systems and Cycles', 'Science - Energy and Interactions', 'Nature of Science'] },
  { name: 'Entrepreneurship', pick: 5, note: 'Ideating Start-up is already a Year 2 core module for you, so pick another module in its place.', modules: ['Understanding Entrepreneurialism', 'Accounting for Non-Specialist', 'Introduction to Finance, Entrepreneurship and Small Business', 'Social Entrepreneurship and Ethics', 'Introduction to Family Business', 'Ideating Start-up', 'Interactive and Digital Marketing'] },
  { name: 'Finance', pick: 5, note: 'Introduction to Finance is compulsory for non-Business students.', modules: ['Introduction to Finance', 'Corporate Finance', 'Financial Markets', 'Personal Financial Planning', 'Risk Management', 'Portfolio Management', 'International Finance', 'Derivatives'] },
  { name: 'Fintech', pick: 5, modules: ['Blockchain Economics', 'FinTech and Innovation', 'Introduction to Cloud Computing', 'Secured Software Systems', 'Professional Project Management'] },
  { name: 'Game Design', pick: 5, modules: ['Games Development', 'Game Studies', 'Sonic Design', '3D Modelling', 'Experiential Design'] },
  { name: 'International Business', pick: 5, note: c5, modules: ['Introduction to International Business', 'Export Practices and Management', 'International Business Issues and Policies', 'Transnational Management', 'International Economic Theory and Policy', 'International Trade and Multinational Business', 'International Marketing', 'International Finance'] },
  { name: 'Journalism and Media Practice', pick: 5, modules: ['Introduction to Mass Communication', 'Journalism Fundamentals', 'Newsgathering and Writing', 'Narrative Journalism', 'Broadcast Journalism', 'Activism and the Media', 'New Media Production'] },
  { name: 'Management', pick: 5, note: c5, modules: ['Introduction to Management', 'Organisational Behaviour', 'Introduction to International Business', 'Strategic Management', 'Leadership and Change Management', 'Transnational Management', 'Entrepreneurship and Small Business', 'Sustainable Supply Chain Management'] },
  { name: 'Marketing', pick: 5, note: c5, modules: ['Principles of Marketing', 'Consumer Behaviour', 'Interactive and Digital Marketing', 'Integrated Marketing Communication', 'Social Media Marketing', 'Services Marketing', 'International Marketing', 'Marketing Analytics'] },
  { name: 'Mass Communication', pick: 5, modules: ['Introduction to Mass Communication', 'Communication Theory', 'Intercultural Communication', 'Visual Communication', 'Media Writing', 'Public Relations Principles', 'Advertising Fundamentals'] },
  { name: 'Nutrition with Wellness', pick: 5, modules: ['Introduction to Human Nutrition', 'Applied Nutrition', 'Basic Pharmacology and Toxicology with Health Informatics', 'Human Physiology', 'Nutrition in Health & Diseases', 'Epidemiology, Public Health and Bioethics, Biostatistics'] },
  { name: 'Performing Arts', pick: 5, modules: ['Introduction to Creative Writing', 'Fundamentals of Mechanics and Filmmaking', 'Introduction to Acting', 'Fundamentals of Choir Performance', 'Introduction to Dance and Creative Processes'] },
  { name: 'Project Management', pick: 5, modules: ['Risk Management for Project', 'Project Management Fundamentals', 'Project Communication and Stakeholder Management', 'Project Schedule, Cost and Quality Management', 'Professional Project Management'] },
  { name: 'Psychology', pick: 5, modules: ['Introduction to Psychology', 'Learning and Motivation', 'Human Personality', 'Social Psychology', 'Developmental Psychology', 'Ethics in Psychology'] },
  { name: 'Public Relations', pick: 5, modules: ['Introduction to Mass Communication', 'Public Relations Principles', 'Promotional Writing', 'Publicity and Media Relations', 'Crisis Management', 'Organisational Communication', 'International Public Relations'] },
  { name: 'Social Media Management', pick: 5, note: 'Introduction to Social Media is compulsory.', modules: ['Introduction to Social Media', 'Media Law and Ethics', 'Media Analytics', 'Social Media Marketing', 'Social Media for Events', 'New Media Production', 'Brand Management', 'Crisis Management', 'Promotional Writing'] },
  { name: 'Special Educational Needs', pick: 5, modules: ['Behavioural Management in Special Education', 'Introduction to Children with Special Educational Needs', 'Supporting Children with Specific Learning Difficulties', 'Policy and Legislative Framework on Special Education', 'Assessment and Intervention for Children with Special Educational Needs', 'Expressive Arts Therapy', 'Music and Drama Therapy'] },
  { name: 'Sustainable Food Systems', pick: 5, modules: ['Introduction to Food Science and Nutrition', 'Agrifood Production and Supply Chain Management', 'Sustainable Agriculture', 'Food Sociology', 'Nutraceuticals and Functional Food', 'Community Nutrition'] },
  { name: 'TESOL', pick: 5, modules: ['Academic Reading & Writing', 'ELT Methodology', 'Materials Development in ELT', 'Recent Developments in ELT', 'Capstone Project', 'Introduction to Applied Linguistics I'] },
];

// Second major = 12 modules (48 credits) from another school; graduating total becomes 148 credits.
export const SECOND_MAJORS: Package[] = [
  { name: 'Creative Media Design', pick: 12, modules: ['Typography', 'Illustration and Visual Narrative', 'Digital Photography and Imaging', 'Design Principles', 'Advanced Typography', 'Video and Sound Production', 'Interactive Design', 'Intercultural Design', 'Information Design', 'Brand Corporate Identity', 'Application Design I', '3D Modelling', 'Animation Fundamentals', 'Anatomy and Character Sculpture', 'Digital and Social Media Communication', 'Motion Graphics and Compositing', 'Digital Matte Painting', 'Advanced Interactive Design', 'Minor Project'] },
  { name: 'Education', pick: 12, note: 'Only part of the module list is published. Check your Programme Guide.', modules: ['Philosophy and Curriculum Design', 'Education, School and Society', 'The Reflective Practitioner: Teachers Investigate Their Work', 'Action Research Project', 'Professional Practice I', 'Professional Practice II', 'Theory into Practice', 'Teaching and Managing Diverse Learners in the Classroom', 'Learning, Assessment and Feedback', 'New Pedagogies - Digital Tools and Resources'] },
  { name: 'Psychology', pick: 10, note: 'Choose 10 of these 13. Check your Programme Guide for the rest of the 12.', modules: ['Introduction to Psychology', 'Human Personality', 'Learning and Motivation', 'Biological Psychology', 'Developmental Psychology', 'Abnormal Psychology', 'Social Psychology', 'Cognitive Psychology', 'Psychological Tests and Measurements', 'Qualitative Methods', 'Ethics in Psychology', 'Research in Psychology', 'Quantitative Methods'] },
];

// Free electives: choose 5 from three clusters, unrelated to your major. At least one per cluster is encouraged.
export const ELECTIVE_CLUSTERS: { name: string; short: string; modules: string[] }[] = [
  { name: 'Arts, Humanities and Social Sciences', short: 'AHSS', modules: ['Brand Management', 'Advertising Fundamentals', 'Strategic Copywriting', 'Introduction to Mass Communication', 'Intercultural Communication', 'Media Writing', 'Organisational Communication', 'Public Speaking for Success', 'Introduction to Social Media', 'Narrative Writing', 'Film Studies', 'Trends in New Media', 'Behavioural Management in Special Education', 'Introduction to Children with Special Educational Needs', 'Supporting Children with Specific Learning Difficulties', 'Policy and Legislative Framework on Special Education', 'Assessment and Intervention for Children with Special Educational Needs', 'Expressive Arts Therapy', 'Music and Drama Therapy', 'Microeconomics', 'Applied Econometrics', "Promoting Children's Wellbeing", 'Early Science and Numeracy', 'Literacy and Language Development', 'Managing Behaviour and Safety', 'Advancing Play and Learning', 'Inclusive Education', 'French Basic', 'French Intermediate', 'Journalism Fundamentals', 'Newsgathering and Writing', 'Narrative Journalism', 'Activism and the Media', 'Alternative Dispute Resolution', 'Legal Skills and Methods', 'Korean I', 'Korean II', 'Chinese Language I', 'Chinese Language II', 'Public Relations Principles', 'Promotional Writing', 'Publicity and Media Relations', 'Crisis Management', 'International Public Relations', 'Introduction to Psychology', 'Human Personality', 'Learning and Motivation', 'Developmental Psychology', 'Social Psychology', 'Ethics in Psychology', 'Data and Media Analysis for Tourism', 'Sociology of Tourism', 'Holistic Approach to Health and Wellness', 'Destination Geography & Analysis', 'Tourism Economics', 'Adventure Tourism', 'Fundamentals of Choir Performance', 'Fundamentals of Mechanics and Filmmaking', 'Introduction to Acting', 'Video and Sound Production', 'Introduction to Dance and Creative Processes', 'Introduction to Creative Writing'] },
  { name: 'Business, Services and Management', short: 'BSM', modules: ['Introduction to Accounting', 'Malaysian Taxation', 'Ethics and Corporate Governance', 'Islamic Banking and Finance', 'Introduction to International Business', 'Entrepreneurship and Small Business', 'Introduction to Family Business', 'Environmental, Social, and Governance (ESG) Principles and Practices', 'Understanding Entrepreneurialism', 'Food Sociology', 'Food Media', 'Food Business Management', 'Events Project Management', 'Events and Entertainment', 'Conventions and Meetings Management', 'Event and Tourism Risk Management', 'Event Sponsorship and Funding', 'Social Media for Events', 'Sustainable Event Management', 'Introduction to Finance', 'Bank Management', 'Financial Markets', 'Futures and Options', 'Personal Financial Planning', 'Portfolio Management', 'Risk Management', 'Service Quality Management in Hospitality', 'Human Resource Management', 'Introduction to Management', 'Sustainable Supply Chain Management', 'Leadership and Change Management', 'Social Entrepreneurship and Ethics', 'Project Management Fundamentals', 'Risk Management for Project', 'Project Communication and Stakeholder Management', 'Principles of Marketing', 'Marketing Analytics'] },
  { name: 'Science, Technology and Society', short: 'STS', modules: ['Sustainable Agriculture', 'Architecture and Environment', 'Computer Applications', 'Architecture History and Theory', 'Cell Biology', 'Introduction to Biotechnology', 'Principles of Organic Chemistry', 'Fundamental of Chemistry', 'Sensory Evaluation of Food', 'Food Safety and Sanitation', 'Food Packaging and Labelling', 'Illustration and Visual Narrative', 'Typography', 'Design Principles', 'Digital Photography and Imaging', 'Intercultural Design', 'Design Communication', 'Inter Design Exchange', 'Contemporary Design Theories', 'Narrative Media', 'Materials and Finishes', 'Embedded Systems', 'Lighting Interactive Design', 'Management Information Systems', 'Mathematics of Finance', 'Fundamentals of Linear Algebra', 'Occupational Health and Safety Management', 'Introduction to Food Science and Nutrition', 'Introduction to Human Nutrition', 'Performative Media', 'Home Automation', 'Data Mining', 'Mobile Applications Development', 'Programming', 'Database Systems', 'Object Oriented Programming', 'Human Computer Interaction', 'Web Development Technologies', 'Web Applications Programming', 'Data Science Principles', 'Introduction to Mobile Computing', 'Wireless Networks and Security', 'Internet of Things'] },
];
export const ELECTIVES_NEEDED = 5;

export const RULES = [
  'Minor: 5 modules (20 credits) outside your discipline.',
  'Extension: 5 modules (20 credits) that deepen your field.',
  'Second major: 12 modules (48 credits) from another school. Your graduating total becomes 148 credits.',
  'Free electives: 5 modules from the three clusters, unrelated to your major. Aim for at least one from each cluster.',
  'Taking an extension and a minor together: no shared compulsory modules, and the minor must be from a different school.',
];

// Free electives grouped by the school that teaches the subject. Taylor's guide only lists the three
// clusters, so the school is inferred from the subject area.
const SCHOOL_OF: Record<string, string> = {};
const put = (school: string, mods: string[]) => mods.forEach((m) => { SCHOOL_OF[m] = school; });
put("Taylor's Business School", ['Microeconomics', 'Applied Econometrics', 'Introduction to Accounting', 'Malaysian Taxation', 'Ethics and Corporate Governance',
  'Islamic Banking and Finance', 'Introduction to International Business', 'Entrepreneurship and Small Business', 'Introduction to Family Business',
  'Environmental, Social, and Governance (ESG) Principles and Practices', 'Understanding Entrepreneurialism', 'Introduction to Finance', 'Bank Management',
  'Financial Markets', 'Futures and Options', 'Personal Financial Planning', 'Portfolio Management', 'Risk Management', 'Human Resource Management',
  'Introduction to Management', 'Sustainable Supply Chain Management', 'Leadership and Change Management', 'Social Entrepreneurship and Ethics',
  'Project Management Fundamentals', 'Risk Management for Project', 'Project Communication and Stakeholder Management', 'Principles of Marketing',
  'Marketing Analytics', 'Mathematics of Finance']);
put('School of Media and Communication', ['Brand Management', 'Advertising Fundamentals', 'Strategic Copywriting', 'Introduction to Mass Communication',
  'Intercultural Communication', 'Media Writing', 'Organisational Communication', 'Public Speaking for Success', 'Introduction to Social Media',
  'Narrative Writing', 'Film Studies', 'Trends in New Media', 'Journalism Fundamentals', 'Newsgathering and Writing', 'Narrative Journalism',
  'Activism and the Media', 'Public Relations Principles', 'Promotional Writing', 'Publicity and Media Relations', 'Crisis Management', 'International Public Relations']);
put('School of Education', ['Behavioural Management in Special Education', 'Introduction to Children with Special Educational Needs',
  'Supporting Children with Specific Learning Difficulties', 'Policy and Legislative Framework on Special Education',
  'Assessment and Intervention for Children with Special Educational Needs', 'Expressive Arts Therapy', 'Music and Drama Therapy',
  "Promoting Children's Wellbeing", 'Early Science and Numeracy', 'Literacy and Language Development', 'Managing Behaviour and Safety',
  'Advancing Play and Learning', 'Inclusive Education']);
put('School of Liberal Arts and Sciences', ['French Basic', 'French Intermediate', 'Korean I', 'Korean II', 'Chinese Language I', 'Chinese Language II',
  'Introduction to Psychology', 'Human Personality', 'Learning and Motivation', 'Developmental Psychology', 'Social Psychology', 'Ethics in Psychology',
  'Fundamentals of Choir Performance', 'Fundamentals of Mechanics and Filmmaking', 'Introduction to Acting', 'Introduction to Dance and Creative Processes',
  'Introduction to Creative Writing']);
put("Taylor's Law School", ['Alternative Dispute Resolution', 'Legal Skills and Methods']);
put('School of Hospitality, Tourism and Events', ['Data and Media Analysis for Tourism', 'Sociology of Tourism', 'Holistic Approach to Health and Wellness',
  'Destination Geography & Analysis', 'Tourism Economics', 'Adventure Tourism', 'Events Project Management', 'Events and Entertainment',
  'Conventions and Meetings Management', 'Event and Tourism Risk Management', 'Event Sponsorship and Funding', 'Social Media for Events',
  'Sustainable Event Management', 'Service Quality Management in Hospitality']);
put('School of Food Studies and Gastronomy', ['Food Sociology', 'Food Media', 'Food Business Management', 'Sensory Evaluation of Food',
  'Food Safety and Sanitation', 'Food Packaging and Labelling']);
put("Taylor's Design School", ['Illustration and Visual Narrative', 'Typography', 'Design Principles', 'Digital Photography and Imaging', 'Intercultural Design',
  'Design Communication', 'Inter Design Exchange', 'Contemporary Design Theories', 'Narrative Media', 'Performative Media', 'Video and Sound Production']);
put('School of Architecture, Building and Design', ['Architecture and Environment', 'Architecture History and Theory', 'Materials and Finishes', 'Lighting Interactive Design']);
put('School of Computer Science', ['Computer Applications', 'Management Information Systems', 'Data Mining', 'Mobile Applications Development', 'Programming',
  'Database Systems', 'Object Oriented Programming', 'Human Computer Interaction', 'Web Development Technologies', 'Web Applications Programming',
  'Data Science Principles', 'Introduction to Mobile Computing', 'Wireless Networks and Security', 'Internet of Things']);
put('School of Engineering', ['Embedded Systems', 'Home Automation', 'Occupational Health and Safety Management', 'Fundamentals of Linear Algebra']);
put('School of Biosciences', ['Sustainable Agriculture', 'Cell Biology', 'Introduction to Biotechnology', 'Principles of Organic Chemistry', 'Fundamental of Chemistry',
  'Introduction to Food Science and Nutrition', 'Introduction to Human Nutrition']);

export function electivesBySchool(): { school: string; modules: { name: string; cluster: string }[] }[] {
  const out = new Map<string, { name: string; cluster: string }[]>();
  for (const c of ELECTIVE_CLUSTERS) for (const name of c.modules) {
    const school = SCHOOL_OF[name] ?? 'Other';
    if (!out.has(school)) out.set(school, []);
    if (!out.get(school)!.some((x) => x.name === name)) out.get(school)!.push({ name, cluster: c.short });
  }
  return [...out].map(([school, modules]) => ({ school, modules })).sort((a, b) => (a.school === 'Other' ? 1 : b.school === 'Other' ? -1 : a.school.replace("Taylor's ", '').localeCompare(b.school.replace("Taylor's ", ''))));
}
