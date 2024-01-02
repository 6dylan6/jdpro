
"""
15 0 * * * jd_pullfix.py
new Env('拉库|更新问题修复');
"""
#!/usr/bin/env python3
# coding: utf-8

import os

def pullfix():
    print('\n对拉库失败、拉库成功但更新不出任务等问题修复\n')
    print('\n开始执行。。。\n')
    dir_path = os.path.dirname(os.path.abspath(__file__))
    if 'main' not in dir_path:
        if os.path.isdir('/ql/repo/6dylan6_jdpro'):
            os.system('rm -rf /ql/repo/6dylan6_jdpro')
        elif os.path.isdir('/ql/data/repo/6dylan6_jdpro'):
            os.system('rm -rf /ql/data/repo/6dylan6_jdpro')
        else:
            print('无需修复，拉不动可能是代理问题')
            # os.system('find /ql -maxdepth 2 -type d')
            return False
    else:
        if os.path.isdir('/ql/repo/6dylan6_jdpro_main'):
            os.system('rm -rf /ql/repo/6dylan6_jdpro_main')
        elif os.path.isdir('/ql/data/repo/6dylan6_jdpro_main'):
            os.system('rm -rf /ql/data/repo/6dylan6_jdpro_main')
        else:
            print('无需修复，拉不动可能是代理问题\n')
            # os.system('find /ql -maxdepth 2 -type d')
            return False
    return True

if pullfix():
    print('修复完成，再拉库试试！，如果还不行是网络或代理问题！！！')