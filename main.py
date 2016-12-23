#!/usr/bin/env python
# -*- coding: utf-8 -*-

from __future__ import print_function
import sys, time, os, re
from flask import Flask, render_template, request, jsonify
from xlrd import open_workbook

state = [0]

pylist_data = []

def get_master():
    if state[0] == 0:
        book = open_workbook('DB' + os.path.sep + 'masterobat.xls')
        s = book.sheet_by_index(0)
        for row in range(s.nrows):
            if s.cell(row,0).value == '' or s.cell(row,0).value[0].isalpha() or s.cell(row,0).value[0] == ' ':
                continue
            else:
                pylist_data.append([s.cell(row,0).value, s.cell(row,1).value, s.cell(row,2).value, s.cell(row,3).value])
        state.pop()
        state.append(1)
        return pylist_data
    else:
        return pylist_data
            
def get_master_kw(token):
    result = []
    for i in get_master():
        if re.match('.*{}.*'.format(token.upper()), i[1]):
            result.append(i)
        else:
            pass
    return result

searchkw = []
                
        

app = Flask(__name__)

@app.route("/")
def hello():
    return render_template('index.html')


@app.route("/test", methods=['GET','POST'])
def test():
    return render_template('index.html')


@app.route("/queryreq", methods=['GET'])
def queryreq():
    if request.method == 'GET':
        searchkw.append(request.args.get('key',''))
        try:
            return jsonify(result = get_master_kw(searchkw[0]))
        finally:
            searchkw.pop()
        
@app.route("/tambahmaster")
def tambahmaster():
    return render_template('index.html')

if __name__ == "__main__":
    sys.stdout.flush()
    app.run(host='0.0.0.0', port=5000, debug=False)
    
