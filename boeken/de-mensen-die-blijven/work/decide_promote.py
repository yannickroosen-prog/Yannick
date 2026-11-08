import json,sys,subprocess,os
S='/home/user/Yannick/.claude/skills/book-genesis/scripts'
for n in sys.argv[1:]:
    d=f'evaluations/compare-ch{n}-'+os.environ.get('SUF','r1')
    m=json.load(open(f'{d}/manifest.private.json')); idx={}; ok=True
    for r in m['readers']:
        p=r['persona']; name=r['reader']
        if not os.path.exists(f'{d}/{p}.raw.json'): print(n,p,'MISSING'); ok=False; continue
        chs=['--chapter',m['accepted']['path'],'--chapter',m['candidate']['path']]
        for c in m.get('context',[]): chs+=['--chapter',c['path']]
        o=subprocess.run(['python3',f'{S}/validate_blind_reader.py',*chs,'--report',f'{d}/{p}.raw.json','--expected-reader',name,'--catalog',f'{d}/{p}.catalog.json'],capture_output=True,text=True)
        open(f'{d}/{p}.validation.json','w').write(o.stdout)
        if o.returncode: print(n,p,'INVALID',o.stdout[-300:],o.stderr[-300:]); ok=False
        idx[p]={'report':f'{p}.raw.json','validation':f'{p}.validation.json'}
    if not ok: continue
    json.dump(idx,open(f'{d}/reports-index.json','w'),indent=1)
    dec=f'evaluations/decisions/chapter-{n}-r1.json'
    o=subprocess.run(['python3',f'{S}/decide_comparison.py','--manifest',f'{d}/manifest.private.json','--index',f'{d}/reports-index.json','--chapter',str(int(n)),'--output',dec],capture_output=True,text=True)
    D=json.load(open(dec)) if os.path.exists(dec) else {}
    print(n,'decision',D.get('decision'),[(v['reader'],v['prefers'],v['turn_page']) for v in D.get('votes',[])], o.stderr[-200:])
    if D.get('decision')=='promote':
        o=subprocess.run(['python3',f'{S}/promote_chapter.py','--accepted',f'manuscript/chapters/chapter-{n}.md','--candidate',f'work/attempts/chapter-{n}/stage-r1/chapter.md','--decision',dec,'--receipt',f'evaluations/promotions/chapter-{n}-r1.json','--lock-file','manuscript/chapters/.book-genesis-write.lock'],capture_output=True,text=True)
        print(n,'promote rc',o.returncode,o.stderr[-200:])
