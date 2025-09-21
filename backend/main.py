from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TestAnswers(BaseModel):
    FAQ: dict
    NPI: dict
    GDS: dict
    CDR: dict


@app.post("/predict")
async def predict(answers: TestAnswers):
    # FAQ: sum of 10 questions, each 0-3
    faq_score = sum(int(answers.FAQ.get(f"Q{i+1}", 0)) for i in range(10))

    # NPI: sum of frequency * severity for each domain
    npi_score = 0
    for domain in [
        'Delusions', 'Hallucinations', 'Agitation/Aggression', 'Depression/Dysphoria', 'Anxiety', 'Elation/Euphoria',
        'Apathy/Indifference', 'Disinhibition', 'Irritability/Lability', 'Aberrant Motor Behavior', 'Nighttime Behavior Disturbances', 'Appetite/Eating'
    ]:
        freq = answers.NPI.get(domain, {}).get('frequency', 0)
        sev = answers.NPI.get(domain, {}).get('severity', 0)
        try:
            npi_score += int(freq) * int(sev)
        except:
            pass

    # GDS: sum of 15 yes/no answers, each 0/1
    gds_score = sum(int(answers.GDS.get(f"Q{i+1}", 0)) for i in range(15))

    # CDR: sum of 6 domains, each 0, 0.5, 1, 2, 3
    cdr_score = 0
    for domain in [
        'Memory', 'Orientation', 'Judgment & Problem Solving', 'Community Affairs', 'Home & Hobbies', 'Personal Care'
    ]:
        val = answers.CDR.get(domain, 0)
        try:
            cdr_score += float(val)
        except:
            pass

    # Prediction logic (simple thresholds, can be improved)
    likely = False
    if faq_score > 9 or npi_score > 12 or gds_score > 5 or cdr_score > 2:
        likely = True

    result = f"Likely Alzheimer's (FAQ: {faq_score}, NPI: {npi_score}, GDS: {gds_score}, CDR: {cdr_score})" if likely else f"Unlikely Alzheimer's (FAQ: {faq_score}, NPI: {npi_score}, GDS: {gds_score}, CDR: {cdr_score})"
    return {"result": result}
