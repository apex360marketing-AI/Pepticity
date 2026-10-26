import json,re,sys
T=json.load(open('/tmp/claude-0/-home-user-Apex-Agents-Bots/f5f77d16-71d5-5266-8292-e551fb9458e6/scratchpad/inv.json'))['tables']
def clean(s): s=re.sub(r'\*\*|`','',s or ''); s=re.sub(r'<br>\s*',' ',s); return s.strip()
def pct(s):
    m=re.match(r'\s*(\d+)',s or ''); return int(m.group(1)) if m else None
def find(prefix): return next(v for k,v in T.items() if k.startswith(prefix))
def urlof(s):
    m=re.search(r'\(([A-Za-z0-9]{22})\)',s or ''); return 'https://claude.ai/artifact/'+m.group(1) if m else None
pep=[]
for p in ('3.1','3.2','3.3'):
    for r in find(p):
        it=r.get('Item','')
        pep.append({'item':clean(re.sub(r'\s*\([A-Za-z0-9]{22}\)','',it))[:140],'url':urlof(it),'note':clean(r.get('What it is',''))[:200],'status':clean(r.get('Status','')),'pct':pct(r.get('%')),'left':clean(r.get("What's left",''))[:260]})
sites=[]
for p,proj in (('2.1','APEX hubs'),('2.2','APEX 29 designs'),('2.4','APEX product'),('2.5','APEX internal'),('4.','Other clients')):
    for r in find(p):
        nm=r.get('Item') or r.get('Group') or r.get('Project')
        sites.append({'name':clean(re.sub(r'\s*\([A-Za-z0-9]{22}\)','',nm))[:120],'url':urlof(nm),'project':proj,'status':clean(r.get('Status','')),'pct':pct(r.get('%')),'line':clean(r.get('What it is') or r.get('Designs (one-liners from the Build Index)') or r.get('Artifacts') or r.get("What's left",''))[:220]})
skills=[{'name':clean(r['Skill']),'what':clean(r['Purpose'])[:220],'where':'APEX repo'} for r in find('5.1')]
skills+=[{'name':clean(r['Skill']),'what':clean(r['Purpose'])[:220],'where':'PEPTICITY repo'} for r in find('5.2')]
skills+=[{'name':clean(r['Group']),'what':clean(r['Skills'])[:400],'where':'Global (synced)'} for r in find('5.3')]
extra=json.load(open(sys.argv[1])) if len(sys.argv)>1 else []
skills=extra+skills
tools=[{'name':clean(r['Tool'])+' ('+clean(r['Repo'])+')','what':clean(r['What it does'])[:240]} for r in find('6.')]
status={
 'summary':'As of 26 Oct 2026: 60 Claude Code sessions, 200+ published pages (82 in the Build Index), '+str(len(skills))+' skill entries and '+str(len(tools))+' tools. PEPTICITY is about 30% of the way to launch, and one business-model decision blocks it.',
 'projects':[
  {'name':'PEPTICITY (Grace)','pct':30,'status':'In progress','count':'15 pages and samples','line':'Your Area is approved as the template. The guided tour and quiz look need redoing. Launch is blocked by the legal and business-model decision (see Focus next).'},
  {'name':'APEX 360: 29 designs','pct':60,'status':'Samples, audited','count':'29 sites','line':'All 29 load and work after the 26 Oct audit, with fixes live. Favourites: The Descent and Frame by Frame. Two early designs use a muted gold palette and should be retired.'},
  {'name':'APEX hubs','pct':88,'status':'Done (v1)','count':'Build Index, Showcase, Handoff','line':'Build Index 95%, Showcase 85%. The Handoff pack is missing the 7 newest skills and rules.'},
  {'name':'APEX Effects Library','pct':60,'status':'In progress','count':'90 of 218 effects','line':'90 effects are live modules. The instant-site generator needs 60 to 80 of them on the shared token standard.'},
  {'name':'Instant-site generator','pct':15,'status':'Started (Phase 0)','count':'12 decisions made','line':'Phase 0 is the effect library on the token standard, then a kiosk demo, then self-serve.'},
  {'name':'APEX lead-magnet app','pct':45,'status':'In progress','count':'Next.js, 33 industry pages','line':'Not deployed and Stripe not connected. Check its status file for any invented reviews.'},
  {'name':'War Room / Brain / agent OS','pct':40,'status':'In progress, waiting on you','count':'10+ consoles and mockups','line':'Blocked on your Higgsfield sandbox approval, the hourly Brain sync "yes", a GitHub sign-in for the Brain repo and the War Room palette pick.'},
  {'name':'Northern Peptides','pct':75,'status':'In progress','count':'32-page site','line':'Built and hardened. The repo push needs one command from you.'}
 ],
 'pepticity':pep,
 'focus':[
  'PEPTICITY BUSINESS MODEL AND LEGAL GATE. The 23 Oct handoff says Grace has no clinician or pharmacy and wanted a research-use-only store. Everything since is clinician-first, and Health Canada calls research-use-only selling of these peptides illegal. You, Grace and counsel pick one model before the full build.',
  'PEPTICITY production site on the approved template, rebuilt to the new master prompt (Ivory Descent, the window, the lab, the stage, the auto-starting tour, hooks), sample first. Send Grace the store-fix list and inventory confirmations at the same time.',
  'Higgsfield credits for the PEPTICITY films (the balance is about 462). The exact cost goes to you before anything is spent.',
  'APEX: retire or recolour the two muted-gold early designs, refresh the Handoff pack with the 7 new skills, and confirm keep or cut on the 19 Oct product pages.',
  'Unblock the items waiting on you: the Higgsfield sandbox approval, the Brain sync "yes", the Brain repo GitHub sign-in, the Northern Peptides push and the War Room palette.'
 ],
 'sites':sites,'skills':skills,'tools':tools}
json.dump(status,open('status.json','w'),indent=1,ensure_ascii=False)
print(len(pep),len(sites),len(skills),len(tools))
