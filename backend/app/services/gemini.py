import os
import json
from google import genai

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generate_quote(job_description: str):
    prompt = f'''
You are a professional electrical estimator in South Africa.

Generate a realistic quotation estimate for the job below.

Return ONLY valid JSON in this exact format:

{{
  "labour": 3500,
  "materials": 2800,
  "vat": 945,
  "total": 7245,
  "scope_of_work": [
    "Install LED downlights",
    "Replace DB board"
  ]
}}

Job description:
{job_description}
'''

response = client.models.generate_content(
    model="gemini-2.5-flash-lite",
    contents=prompt,
)
text = response.text.strip()

if text.startswith("```"):
    text = text.strip('`')
if text.startswith("json"):
    text = text[4:].strip()

    return json.loads(text)

