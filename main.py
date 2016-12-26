#!/usr/bin/env python
# -*- coding: utf-8 -*-

from __future__ import print_function
import sys, time, os, re, json, pickle, xlrd, xlwt
from flask import Flask, render_template, request, jsonify
from xlrd import open_workbook
from xlutils.copy import copy as xlcopy


DB = 'app2015'


cached = {
    'state' : 0,
    'blocking': 0,
    'master_barang': [],
    'non_master_temp': []
}


def read_file(raw_master_file):
  with open(raw_master_file,'r') as rmf:
    return rmf.read()


def create_master_list_from_string(the_string):
  a = string.split(re.sub('\r','', the_string),'\n')
  amount_of_dashes = []
  for line in a:
    if '----' in line:
      for i in string.split(line,' '):
        amount_of_dashes.append(len(i))
      break
  master_list = []
  for line in a:
    if len(line) > 0:
      if line[0].isdigit() or re.match('^ *\d*\.\d*', line):
        line_list = []
        curs = 0
        for col in amount_of_dashes:
          line_list.append(re.sub('^ *| *$','',line[curs:curs+col]))
          curs = curs + col + 1
        master_list.append(line_list)
  return master_list


def update_master_barang():
	os.system('db2 connect to {0} user db2admin using Db2ibmrd7'.format(DB))
    lmb = create_master_list_from_string(subprocess.Popen("db2 select KODE_OBAT, NAMA_OBAT, SATUAN_OBAT, HNAPPNREG_OBAT from TBMASOBAT", stdout=subprocess.PIPE).communicate()[0])
    os.remove('DB' + os.path.sep + 'masterobat.xls')
    wb = xlwt.Workbook()
    s = wb.add_sheet('Sheet1')
    s.write(0, 0, 'KODE_OBAT')
    s.write(0, 1, 'NAMA_OBAT')
    s.write(0, 2, 'SATUAN_OBAT')
    s.write(0, 3, 'HNAPPNREG_OBAT')
    for row in range(len(lmb)):
        for col in range(4):
            s.write(row + 1, col, lmb[row][col])
    wb.save('DB' + os.path.sep + 'masterobat.xls')


def get_master():
    if cached['state'] == 0:
        book = open_workbook('DB' + os.path.sep + 'masterobat.xls')
        s = book.sheet_by_index(0)
        for row in range(1, s.nrows):
            cached['master_barang'].append([s.cell(row,0).value, s.cell(row,1).value, s.cell(row,2).value, s.cell(row,3).value])
        
        book_nm = open_workbook('DB' + os.path.sep + 'nonmaster.xls')
        s_nm = book_nm.sheet_by_index(0)
        for row in range(1, s_nm.nrows):
            cached['master_barang'].append([s_nm.cell(row,0).value, s_nm.cell(row,1).value, s_nm.cell(row,2).value, s_nm.cell(row,3).value])
        
        cached['state'] = 1
        return cached['master_barang']
    else:
        return cached['master_barang']
            
def get_master_kw(token):
    result = []
    for i in get_master():
        if re.match('.*{}.*'.format(token.upper()), i[1]):
            result.append(i)
        else:
            pass
    return result


def get_today():
    return str(time.localtime().tm_year) + '-' + str(time.localtime().tm_mon) + '-' + str(time.localtime().tm_mday)


def get_pickled_date():
    with open('last_date.pkl','rb') as f:
        return pickle.load(f)


def get_pickled_num():
    with open('last_num.pkl','rb') as f:
        return pickle.load(f)


def is_today():
    return get_pickled_date() == get_today()


def update_pickled_date():
    with open('last_date.pkl','wb') as f:
        pickle.dump(get_today(), f)


def update_pickled_num(num):
    with open('last_num.pkl','wb') as f:
        pickle.dump(num, f)


def three_digit_number(num):
    len_num = len(str(num))
    if len_num == 1:
        return "00" + str(num)
    elif len_num == 2:
        return "0" + str(num)
    else:
        return str(num)


def increment_pickled_num():
    last_num = get_pickled_num()
    update_pickled_num(last_num + 1)


def get_num():
    if is_today():
        return three_digit_number(get_pickled_num())
    else:
		update_pickled_date()
        update_pickled_num(1)
        return '001'


def get_nomor_penolakan():
    now = time.localtime()
    thn = str(now.tm_year)[2:]
    bln = str(now.tm_mon) if len(str(now.tm_mon)) == 2 else "0" + str(now.tm_mon)
    tgl = str(now.tm_mday) if len(str(now.tm_mday)) == 2 else "0" + str(now.tm_mday)
    return thn + bln + tgl + get_num()


def get_thnbln():
    now = time.localtime()
    thn = str(now.tm_year)
    bln = str(now.tm_mon) if len(str(now.tm_mon)) == 2 else "0" + str(now.tm_mon)
    return thn + bln


def create_excel():
    wb = xlwt.Workbook()
    s = wb.add_sheet('Sheet1')
    style1 = xlwt.XFStyle()
    borders1 = xlwt.Borders()
    borders1.top = xlwt.Borders.THIN
    borders1.right = xlwt.Borders.THIN
    borders1.bottom = xlwt.Borders.THIN
    borders1.left = xlwt.Borders.THIN
    style1.borders = borders1
    s.write(0, 0, 'TANGGAL', style1)
    s.write(0, 1, 'NOMOR PENOLAKAN', style1)
    s.write(0, 2, 'KODE OBAT', style1)
    s.write(0, 3, 'NAMA OBAT', style1)
    s.write(0, 4, 'SATUAN', style1)
    s.write(0, 5, 'JUMLAH', style1)
    s.write(0, 6, 'HNAPPN', style1)
    s.write(0, 7, 'JENIS TRANSAKSI', style1)
    s.write(0, 8, 'HARGA', style1)
    s.write(0, 9, 'SUBTOTAL', style1)
    s.col(0).width = 10 * 305
    s.col(1).width = 20 * 305
    s.col(2).width = 14 * 305
    s.col(3).width = 32 * 305
    s.col(4).width = 10 * 305
    s.col(5).width = 10 * 305
    s.col(6).width = 10 * 305
    s.col(7).width = 16 * 305
    s.col(8).width = 10 * 305
    s.col(9).width = 12 * 305
    wb.save('DATA' + os.path.sep + 'PENOLAKAN-' + get_thnbln() + '.xls')


def update_non_master():
    wb_ = open_workbook('DB' + os.path.sep + 'nonmaster.xls')
    wb = xlcopy(wb_)
    s = wb.get_sheet(0)
    nrows = wb_.sheet_by_index(0).nrows
    for row in range(nrows, len(cached['non_master_temp']) + nrows):
        for col in range(4):
            s.write(row, col, cached['non_master_temp'][row-nrows][col])
        cached['master_barang'].append(cached['non_master_temp'][row-nrows])
    wb.save('DB' + os.path.sep + 'nonmaster.xls')
    cached['non_master_temp'] = []


def update_excel(data):
    wb_ = open_workbook('DATA' + os.path.sep + 'PENOLAKAN-' + get_thnbln() + '.xls', formatting_info=True)
    wb = xlcopy(wb_)
    s = wb.get_sheet(0)
    nrows = wb_.sheet_by_index(0).nrows
    style1 = xlwt.XFStyle()
    borders1 = xlwt.Borders()
    borders1.top = xlwt.Borders.THIN
    borders1.right = xlwt.Borders.THIN
    borders1.bottom = xlwt.Borders.THIN
    borders1.left = xlwt.Borders.THIN
    style1.borders = borders1
    faktor_jual = {
        'HV': 1.15,
        'UPDS': 1.25,
        'RESEP': 1.3
    }
    for row in range(nrows, len(data) + nrows):
        s.write(row, 0, data[row-nrows]['tanggal'], style1) 
        s.write(row, 1, get_nomor_penolakan(), style1)
        if data[row-nrows]['kode_obat'] == "":
            cached['non_master_temp'].append(['NON-MASTER', data[row-nrows]['nama_obat'], data[row-nrows]['satuan'], data[row-nrows]['hnappn']])
            s.write(row, 2, 'NON-MASTER', style1)
        else:
            s.write(row, 2, data[row-nrows]['kode_obat'], style1)
        s.write(row, 3, data[row-nrows]['nama_obat'], style1)
        s.write(row, 4, data[row-nrows]['satuan'], style1)
        s.write(row, 5, data[row-nrows]['qty'], style1)
        s.write(row, 6, data[row-nrows]['hnappn'], style1)
        s.write(row, 7, data[row-nrows]['jenistrx'], style1)
        s.write(row, 8, data[row-nrows]['hnappn'] * faktor_jual[data[row-nrows]['jenistrx']], style1)
        s.write(row, 9, data[row-nrows]['hnappn'] * faktor_jual[data[row-nrows]['jenistrx']] * data[row-nrows]['qty'], style1)
    wb.save('DATA' + os.path.sep + 'PENOLAKAN-' + get_thnbln() + '.xls')
    
    if len(cached['non_master_temp']) != 0:
        update_non_master()


def write_excel(data):
    if os.path.isfile('DATA' + os.path.sep + 'PENOLAKAN-' + get_thnbln() + '.xls'):
        update_excel(data)
    else:
        create_excel()
        update_excel(data)





app = Flask(__name__)


@app.route("/")
def hello():
    return render_template('index.html')


@app.route("/queryreq", methods=['GET'])
def queryreq():
    if request.method == 'GET':
        if cached['blocking'] == 1:
            while True:
                time.sleep(0.5)
                if cached['blocking'] == 1:
                    continue
                else:
                    break
            cached['blocking'] = 1
            res = jsonify(result = get_master_kw(request.args.get('key')))
            cached['blocking'] = 0
            return res
        else:
            cached['blocking'] = 1
            res = jsonify(result = get_master_kw(request.args.get('key')))
            cached['blocking'] = 0
            return res  


@app.route("/save", methods=['POST'])
def save():
    if request.method == 'POST':
        if cached['blocking'] == 1:
            while True:
                time.sleep(0.5)
                if cached['blocking'] == 1:
                    continue
                else:
                    break
            cached['blocking'] = 1
            data = json.loads(request.args.get('data'))
            write_excel(data)
            increment_pickled_num()
            cached['blocking'] = 0
            return "DONE"
        else:
            cached['blocking'] = 1
            data = json.loads(request.args.get('data'))
            write_excel(data)
            increment_pickled_num()
            cached['blocking'] = 0
            return "DONE"



if __name__ == "__main__":
	if not is_today():
	    update_master_barang()
    sys.stdout.flush()
    app.run(host='0.0.0.0', port=5000, debug=False)
    
