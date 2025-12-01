# Job Matcher - Example Usage Guide

## Quick Start Example

### 1. Start the Application

```bash
# Windows
start.bat

# Or manually:
# Terminal 1
npm start

# Terminal 2
cd client
npm run dev
```

### 2. Example CV Text

Here's a sample CV you can use for testing:

```
John Doe
Senior Software Engineer

EXPERIENCE:
- 5+ years of experience in full-stack web development
- Expert in Laravel, PHP, and MySQL
- Proficient in React, Vue.js, and JavaScript
- Experience with Node.js and Express
- Strong knowledge of REST APIs and GraphQL
- Worked with Docker and AWS

SKILLS:
PHP, Laravel, JavaScript, React, Vue.js, Node.js, Express, MySQL, PostgreSQL, MongoDB, Docker, AWS, Git, Agile, REST API, GraphQL

EDUCATION:
Bachelor of Science in Computer Science

PROJECTS:
- Built e-commerce platform using Laravel and React
- Developed real-time chat application with Node.js
- Created inventory management system with Vue.js
```

### 3. Example Search Queries

Try these search queries:

1. **Laravel Developer**
   - Query: `laravel developer`
   - Location: `Sri Lanka`

2. **Software Engineer**
   - Query: `software engineer`
   - Location: `Colombo, Sri Lanka`

3. **Full Stack Developer**
   - Query: `full stack developer react`
   - Location: `Sri Lanka`

4. **DevOps Engineer**
   - Query: `devops engineer`
   - Location: `Sri Lanka`

## API Usage Examples

### Using cURL

#### 1. Upload CV
```bash
curl -X POST http://localhost:3000/api/cv \
  -H "Content-Type: application/json" \
  -d "{\"cvText\": \"Experienced Laravel developer with 5 years of experience in PHP, MySQL, React...\"}"
```

#### 2. Search Jobs
```bash
curl "http://localhost:3000/api/search?query=laravel+developer&location=Sri+Lanka"
```

#### 3. Match Jobs
```bash
curl -X POST http://localhost:3000/api/match \
  -H "Content-Type: application/json"
```

#### 4. Search and Match (Combined)
```bash
curl -X POST http://localhost:3000/api/search-and-match \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"software engineer\", \"location\": \"Sri Lanka\", \"cvText\": \"Your CV here...\"}"
```

### Using JavaScript/Axios

```javascript
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

// 1. Upload CV
async function uploadCV(cvText) {
  const response = await axios.post(`${API_BASE}/cv`, { cvText });
  console.log('CV uploaded:', response.data);
  return response.data;
}

// 2. Search jobs
async function searchJobs(query, location = 'Sri Lanka') {
  const response = await axios.get(`${API_BASE}/search`, {
    params: { query, location }
  });
  console.log(`Found ${response.data.data.count} jobs`);
  return response.data.data.jobs;
}

// 3. Match jobs with CV
async function matchJobs(jobs) {
  const response = await axios.post(`${API_BASE}/match`, { jobs });
  console.log(`Matched ${response.data.data.matchedJobs} jobs`);
  return response.data.data.jobs;
}

// Complete workflow
async function findMatchingJobs() {
  // Upload CV
  await uploadCV('Your CV text here...');
  
  // Search jobs
  const jobs = await searchJobs('laravel developer', 'Sri Lanka');
  
  // Match jobs
  const matchedJobs = await matchJobs(jobs);
  
  // Display top 5 matches
  matchedJobs.slice(0, 5).forEach(job => {
    console.log(`${job.matchPercentage}% - ${job.title} at ${job.company}`);
  });
}

findMatchingJobs();
```

### Using Python

```python
import requests

API_BASE = 'http://localhost:3000/api'

# 1. Upload CV
cv_text = """
Experienced Laravel developer with 5 years of experience...
"""

response = requests.post(f'{API_BASE}/cv', json={'cvText': cv_text})
print(response.json())

# 2. Search jobs
params = {'query': 'laravel developer', 'location': 'Sri Lanka'}
response = requests.get(f'{API_BASE}/search', params=params)
jobs = response.json()['data']['jobs']
print(f"Found {len(jobs)} jobs")

# 3. Match jobs
response = requests.post(f'{API_BASE}/match', json={'jobs': jobs})
matched_jobs = response.json()['data']['jobs']

# Display top matches
for job in matched_jobs[:5]:
    print(f"{job['matchPercentage']}% - {job['title']} at {job['company']}")
```

## Expected Results

### Sample Output

After matching, you should see results like:

```
Match Score | Job Title              | Company        | Location
------------|------------------------|----------------|------------------
85%         | Laravel Developer      | Tech Co        | Colombo, Sri Lanka
78%         | Senior PHP Developer   | StartupXYZ     | Sri Lanka
72%         | Full Stack Developer   | WebAgency      | Colombo
65%         | Software Engineer      | BigCorp        | Sri Lanka
58%         | Backend Developer      | DevShop        | Colombo
```

### Match Score Interpretation

- **70-100% (Green)**: Excellent match - Your skills align very well
- **40-69% (Yellow)**: Good match - Some relevant skills
- **0-39% (Red)**: Low match - Consider if you meet requirements

## Troubleshooting Examples

### Issue: No jobs found

**Solution**: Try broader search terms
```javascript
// Instead of:
searchJobs('senior laravel developer with 5 years experience')

// Try:
searchJobs('laravel developer')
// or
searchJobs('php developer')
```

### Issue: All match scores are low

**Possible causes**:
1. CV doesn't contain relevant keywords
2. Job descriptions are very different from your skills
3. Using simple keyword matching instead of embeddings

**Solution**: 
- Add more relevant skills to your CV
- Try different job searches
- Enable OpenAI embeddings for better matching

### Issue: API errors

**Check**:
1. Is the backend server running? (http://localhost:3000)
2. Are API keys configured in `.env`?
3. Check server logs for errors

## Advanced Usage

### Custom Match Score Threshold

```javascript
// Only show jobs with 50%+ match
const response = await axios.post('/api/match?minScore=0.5');
```

### Filtering by Keywords

```javascript
// Search for specific technologies
const jobs = await searchJobs('react typescript', 'Sri Lanka');
```

### Batch Processing Multiple Searches

```javascript
const queries = [
  'laravel developer',
  'react developer',
  'full stack developer'
];

for (const query of queries) {
  const jobs = await searchJobs(query);
  const matched = await matchJobs(jobs);
  console.log(`${query}: ${matched.length} matches`);
}
```

## Tips for Best Results

1. **CV Quality**
   - Include specific technologies and frameworks
   - Mention years of experience
   - List concrete projects
   - Use industry-standard terminology

2. **Search Queries**
   - Use specific job titles
   - Include key technologies
   - Try variations (e.g., "Laravel" vs "PHP")
   - Combine with location for better results

3. **Matching**
   - Use OpenAI embeddings for better accuracy
   - Review jobs with 40%+ match score
   - Consider context beyond just the score
   - Check job descriptions for requirements

4. **Performance**
   - Cache results to avoid repeated API calls
   - Use combined endpoint for efficiency
   - Limit number of jobs processed at once

## Next Steps

After finding matching jobs:

1. **Review Job Descriptions**: Read full requirements
2. **Prepare Application**: Tailor your CV for specific roles
3. **Apply**: Use the "Apply" button to submit applications
4. **Track Applications**: Keep a record of applied positions
5. **Follow Up**: Monitor application status

---

Happy job hunting! 🎯
