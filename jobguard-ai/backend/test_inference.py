"""Verify the exported inference against the original fitted sklearn model."""
import sys,math,joblib,pandas as pd
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from backend.inference import analyze_text
root=Path(__file__).resolve().parents[2]
model=joblib.load(root/'model.pkl');vectorizer=joblib.load(root/'vectorizer.pkl')
fields=['title','company_profile','description','requirements','benefits','employment_type','required_experience','required_education','industry','function']
df=pd.read_csv(root/'fake_job_postings.csv').fillna('')
texts=df.sample(n=min(1000,len(df)),random_state=42)[fields].astype(str).agg(' '.join,axis=1).tolist()
texts+=['','urgent hire processing fee Zelle Telegram SSN','React developer at fictional company','École café 你好 unicode engineering','a A I _ __ test_test 1234','testing '*2000]
x=vectorizer.transform(texts);pred=model.predict(x);prob=model.predict_proba(x)
max_error=0
for i,text in enumerate(texts):
 p,c=analyze_text(text);expected=float(prob[i,int(pred[i])]*100)
 assert p==int(pred[i]),(i,p,pred[i])
 assert round(c,2)==round(expected,2),(i,c,expected)
 max_error=max(max_error,abs(c-expected))
print(f'PASS: {len(texts)} postings, identical predictions and rounded confidence; max raw percentage error {max_error:.3g}')
from backend.app import app
for payload in [{'title':'test','description':'Send a processing fee via Zelle'},{'title':'Developer','description':'Build accessible React applications with a product team'}]:
 response=app.test_client().post('/api/analyze',json=payload)
 assert response.status_code==200
 print(response.get_json())
