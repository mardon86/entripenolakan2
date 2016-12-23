var Table = function (upperpanel) {
    this.upperpanel = upperpanel;
    this.widget = document.createElement('table');
    this.widget.style.width = '772px';
    this.widget.tabIndex = '1';
    this.data_counter = 0

    document.getElementById('tab_rows').appendChild(this.widget);
    
    this.empty_data = function (n) {
        return {
            num: n,
            nama_obat: '',
            satuan: '',
            qty: '',
            harga: '',
            subtotal: ''
        }
    }
    
    this.rows_els = [];
    
    this.create_row = function (data) {
        var widget = document.createElement('tr');
        widget.innerHTML =
            "<td class='row'><div style='width:56px;text-align:center;'>" + data.num + "</div></td>" +
            "<td class='row'><div style='width:336px; overflow:hidden;padding-right:0px'><p style='width:500px; margin:0px; text-align:left;'>" + data.nama_obat + "</p></div></td>" +
            "<td class='row'><div style='width:86px;text-align:center;'>" + data.satuan + "</div></td>" +
            "<td class='row'><div style='width:76px;text-align:center;'>" + data.qty + "</div></td>" +
            "<td class='row'><div style='width:96px;text-align:center;'>" + data.harga + "</div></td>" +
            "<td class='row'><div style='width:96px;text-align:center;'>" + data.subtotal + "</div></td>";
        return widget;
    }
    
    for (var i=1; i<11; i++) {
        var el = this.create_row(this.empty_data(i));
        el.onclick = function (e) {
            if (e.target.tagName == 'TD') {
                var target_node = e.target.parentNode;
            } else if (e.target.tagName == 'DIV') {
                var target_node = e.target.parentNode.parentNode;
            } else if (e.target.tagName == 'P') {
                var target_node = e.target.parentNode.parentNode.parentNode;
            }
            this.select_row.bind(this)(this.rows_els.indexOf(target_node));
        }.bind(this);
        this.widget.appendChild(el);
        this.rows_els.push(el);
    }
    
    this.row_height = function () {
        return this.rows_els[0].getBoundingClientRect().height + 2;
    }.bind(this);
    
    this.qty_row_disp = function () {
        return Math.floor((this.widget.parentNode.getBoundingClientRect().height - 15) / this.row_height());
    }.bind(this)
    
    this.get_edges = function() {
        return {
            top: this.widget.parentNode.scrollTop,
            bottom: this.widget.parentNode.scrollTop + (this.qty_row_disp() * this.row_height())
        }
    }.bind(this);

    
    this.keep_in_frame = function () {
        if (this.selected_now > this.selected_before) {
            if ((this.selected_now + 1) * this.row_height() > this.get_edges().bottom || (this.selected_now + 1) * this.row_height() < this.get_edges().top) {
                this.widget.parentNode.scrollTop = (this.selected_now - this.qty_row_disp() + 1) * this.row_height()
            }
        } else {
            if (this.selected_now * this.row_height() < this.get_edges().top || this.selected_now * this.row_height() > this.get_edges().bottom) {
                this.widget.parentNode.scrollTop = this.selected_now * this.row_height()
            }
        }
    }.bind(this)
    
    this.widget.onkeydown = function (e) {
        e.preventDefault();
        if (e.which === 38) {
            // UP
            if (this.selected_now - 1 > -1) {
                this.select_row(this.selected_now - 1);
                this.keep_in_frame();
            }
        } else if (e.which === 40) {
            // DOWN
            if (this.selected_now + 1 < this.rows_els.length) {
                this.select_row(this.selected_now + 1);
                this.keep_in_frame();
            }
        } else if (e.which === 33) {
            // PAGE UP
            if (this.selected_now - this.qty_row_disp() > -1) {
                this.select_row(this.selected_now - this.qty_row_disp());
                this.keep_in_frame();
            } else {
                this.select_row(0);
                this.keep_in_frame();
            }
        } else if (e.which === 34) {
            // PAGE DOWN
            if (this.selected_now + this.qty_row_disp() < this.rows_els.length) {
                this.select_row(this.selected_now + this.qty_row_disp());
                this.keep_in_frame();
            } else {
                this.select_row(this.rows_els.length - 1);
                this.keep_in_frame();
            }
        } else if (e.which === 35) {
            // END
            this.select_row(this.rows_els.length - 1);
            this.keep_in_frame();
        } else if (e.which === 36) {
            // HOME
            this.select_row(0);
            this.keep_in_frame();
        } else if (e.which === 27) {
            // ESC
            document.getElementById('inp_namaobat').focus();
        }
    }.bind(this);
    
    
    this.selected_before = 0;
    this.selected_now = 0;
        
    this.select_row = function (num_row) {
        this.selected_before = this.selected_now;
        this.selected_now = num_row;
        
        for (var h=0; h<6; h++) {
            this.rows_els[this.selected_before].children[h].setAttribute('class', 'row')
        }
        
        for (var i=0; i<6; i++) {
            this.rows_els[this.selected_now].children[i].setAttribute('class', 'selected');
        }
    }
    
    this.select_row(0);
    
    
    this.data = []
    
    this.add_data = function (data) {
        this.data.push({
            kode_obat: data.kode_obat,
            nama_obat: data.nama_obat,
            satuan: data.satuan,
            qty: data.qty,
            harga: data.harga,
            subtotal: data.subtotal
        });
    }
    
    this.rerender_data = function () {
        document.getElementById('tab_rows').removeChild(this.widget);
        delete this.widget;
        delete this.rows_els;
        this.selected_before = 0;
        this.selected_now = 0;
        
        this.widget = document.createElement('table');
        this.widget.style.width = '772px';
        this.widget.tabIndex = '1';
        this.data_counter = 0;
        document.getElementById('tab_rows').appendChild(this.widget);
        this.rows_els = [];
        
        
        if (this.data.length < 10) {
            for (var i=0; i<10; i++) {
                if (i < this.data.length) {
                    var el = this.create_row({
                        num: i + 1,
                        nama_obat: this.data[i].nama_obat,
                        satuan: this.data[i].satuan,
                        qty: this.data[i].qty,
                        harga: this.data[i].harga,
                        subtotal: this.data[i].subtotal
                    });
                } else {
                    var el = this.create_row({
                        num: i + 1,
                        nama_obat: '',
                        satuan: '',
                        qty: '',
                        harga: '',
                        subtotal: ''
                    });
                }
                el.onclick = function (e) {
                    if (e.target.tagName == 'TD') {
                        var target_node = e.target.parentNode;
                    } else if (e.target.tagName == 'DIV') {
                        var target_node = e.target.parentNode.parentNode;
                    } else if (e.target.tagName == 'P') {
                        var target_node = e.target.parentNode.parentNode.parentNode;
                    }
                    this.select_row.bind(this)(this.rows_els.indexOf(target_node));
                }.bind(this);
                this.widget.appendChild(el);
                this.rows_els.push(el);
            }
        } else {
            for (var i=0; i<this.data.length; i++) {
                var el = this.create_row({
                    num: i + 1,
                    nama_obat: this.data[i].nama_obat,
                    satuan: this.data[i].satuan,
                    qty: this.data[i].qty,
                    harga: this.data[i].harga,
                    subtotal: this.data[i].subtotal
                });
                el.onclick = function (e) {
                    if (e.target.tagName == 'TD') {
                        var target_node = e.target.parentNode;
                    } else if (e.target.tagName == 'DIV') {
                        var target_node = e.target.parentNode.parentNode;
                    } else if (e.target.tagName == 'P') {
                        var target_node = e.target.parentNode.parentNode.parentNode;
                    }
                    this.select_row.bind(this)(this.rows_els.indexOf(target_node));
                }.bind(this);
                this.widget.appendChild(el);
                this.rows_els.push(el);
            }
        }
        
        this.widget.onkeydown = function (e) {
            e.preventDefault();
            if (e.which === 38) {
                // UP
                if (this.selected_now - 1 > -1) {
                    this.select_row(this.selected_now - 1);
                    this.keep_in_frame();
                }
            } else if (e.which === 40) {
                // DOWN
                if (this.selected_now + 1 < this.rows_els.length) {
                    this.select_row(this.selected_now + 1);
                    this.keep_in_frame();
                }
            } else if (e.which === 33) {
                // PAGE UP
                if (this.selected_now - this.qty_row_disp() > -1) {
                    this.select_row(this.selected_now - this.qty_row_disp());
                    this.keep_in_frame();
                } else {
                    this.select_row(0);
                    this.keep_in_frame();
                }
            } else if (e.which === 34) {
                // PAGE DOWN
                if (this.selected_now + this.qty_row_disp() < this.rows_els.length) {
                    this.select_row(this.selected_now + this.qty_row_disp());
                    this.keep_in_frame();
                } else {
                    this.select_row(this.rows_els.length - 1);
                    this.keep_in_frame();
                }
            } else if (e.which === 35) {
                // END
                this.select_row(this.rows_els.length - 1);
                this.keep_in_frame();
            } else if (e.which === 36) {
                // HOME
                this.select_row(0);
                this.keep_in_frame();
            } else if (e.which === 27) {
                // ESC
                document.getElementById('inp_namaobat').focus();
            } else if (e.which === 13) {
                if (e.target.tagName == 'TD') {
                    var target_node = e.target.parentNode;
                } else if (e.target.tagName == 'DIV') {
                    var target_node = e.target.parentNode.parentNode;
                } else if (e.target.tagName == 'P') {
                    var target_node = e.target.parentNode.parentNode.parentNode;
                }
                this.upperpanel.inp_namaobat = this.data[this.rows_els.indexOf(target_node)].nama_obat;
            }
        }.bind(this);
        
        this.select_row(0);
        
    }.bind(this);
}





var CariObat = function (visitor, ret) {
    this.visitor = visitor;
    this.widget = document.createElement('div');
    this.widget.style.backgroundColor = '#dddddd';
    this.widget.style.position = 'absolute';
    this.widget.style.left = '0px';
    this.widget.style.top = '0px';
    this.widget.appendChild((function(){
        var div1 = document.createElement('div')
        div1.innerHTML = 
            "<table style='width:793px;'>" +
                "<tr>" +
                    "<th><div style='width:150px;'>Kode Obat</div></th>" +
                    "<th><div style='width:433px;'>Nama Obat</div></th>" +
                    "<th><div style='width:86px;'>Satuan</div></th>" +
                    "<th><div style='width:96px;'>Harga</div></th>" +
                    "<th><div style='width:18px;'></div></th>" +
                "</tr>" +
            "</table>"
        return div1;
    })());
    document.body.appendChild(this.widget);
    this.div_tab = document.createElement('div');
    this.div_tab.style = 'height:500px; width:800px; overflow:scroll;';
    this.widget.appendChild(this.div_tab);
    this.table = document.createElement('table');
    this.table.tabIndex='1';
    this.div_tab.appendChild(this.table);
    
    this.rows_els = [];
    
    this.create_row = function (data, id) {
        var row = document.createElement('tr');
        row.id = id;
        row.innerHTML =
            "<td class='row'><div style='width:150px;text-align:center;'>" + data[0] + "</div></td>" +
            "<td class='row'><div style='width:433px; overflow:hidden;padding-right:0px'><p style='width:500px; margin:0px; text-align:left;'>" + data[1] + "</p></div></td>" +
            "<td class='row'><div style='width:86px;text-align:center;'>" + data[2] + "</div></td>" +
            "<td class='row'><div style='width:96px;text-align:center;'>" + data[3] + "</div></td>";
        this.rows_els.push(row);
        return row;
    }.bind(this);
    
    var res = ret.result;
    for (var i=0; i<res.length; i++) {
        this.table.appendChild(this.create_row.bind(this)(res[i], 'co_' + i));
    }
    
    this.selected_before = 0;
    this.selected_now = 0;

    this.select_row = function (num_row) {
        this.selected_before = this.selected_now;
        this.selected_now = num_row;
        
        for (var h=0; h<4; h++) {
            this.rows_els[this.selected_before].children[h].setAttribute('class', 'row')
        }
        
        for (var i=0; i<4; i++) {
            this.rows_els[this.selected_now].children[i].setAttribute('class', 'selected');
        }
    }.bind(this);
    
    this.select_row(0);
    
    this.rows_els.forEach(function(el){
        el.onclick = function (e) {
            if (e.target.tagName == 'TD') {
                var target_node = e.target.parentNode;
            } else if (e.target.tagName == 'DIV') {
                var target_node = e.target.parentNode.parentNode;
            } else if (e.target.tagName == 'P') {
                var target_node = e.target.parentNode.parentNode.parentNode;
            }
            
            this.select_row.bind(this)(this.rows_els.indexOf(target_node));

        }.bind(this)
    }.bind(this));
    
    this.row_height = this.rows_els[0].getBoundingClientRect().height + 2;
    
    this.qty_row_disp = Math.floor((this.table.parentNode.getBoundingClientRect().height - 15) / this.row_height);
    
    this.get_edges = function() {
        return {
            top: this.table.parentNode.scrollTop,
            bottom: this.table.parentNode.scrollTop + (this.qty_row_disp * this.row_height)
        }
    }.bind(this);
    
    this.keep_in_frame = function () {
        if (this.selected_now > this.selected_before) {
            if ((this.selected_now + 1) * this.row_height > this.get_edges().bottom || (this.selected_now + 1) * this.row_height < this.get_edges().top) {
                this.table.parentNode.scrollTop = (this.selected_now - this.qty_row_disp + 1) * this.row_height
            }
        } else {
            if (this.selected_now * this.row_height < this.get_edges().top || this.selected_now * this.row_height > this.get_edges().bottom) {
                this.table.parentNode.scrollTop = this.selected_now * this.row_height
            }
        }
    }.bind(this)
    
    this.table.onkeydown = function (e) {
        e.preventDefault();
        if (e.which === 38) {
            // UP
            if (this.selected_now - 1 > -1) {
                this.select_row(this.selected_now - 1);
                this.keep_in_frame();
            }
        } else if (e.which === 40) {
            // DOWN
            if (this.selected_now + 1 < this.rows_els.length) {
                this.select_row(this.selected_now + 1);
                this.keep_in_frame();
            }
        } else if (e.which === 33) {
            // PAGE UP
            if (this.selected_now - this.qty_row_disp > -1) {
                this.select_row(this.selected_now - this.qty_row_disp);
                this.keep_in_frame();
            } else {
                this.select_row(0);
                this.keep_in_frame();
            }
        } else if (e.which === 34) {
            // PAGE DOWN
            if (this.selected_now + this.qty_row_disp < this.rows_els.length) {
                this.select_row(this.selected_now + this.qty_row_disp);
                this.keep_in_frame();
            } else {
                this.select_row(this.rows_els.length - 1);
                this.keep_in_frame();
            }
        } else if (e.which === 35) {
            // END
            this.select_row(this.rows_els.length - 1);
            this.keep_in_frame();
        } else if (e.which === 36) {
            // HOME
            this.select_row(0);
            this.keep_in_frame();
        } else if (e.which === 27) {
            //ESC
            document.body.removeChild(this.widget);
            document.getElementById('inp_namaobat').focus();
        } else if (e.which === 13) {
            // ENTER
            this.visitor.kode_obat = this.rows_els[this.selected_now].children[0].children[0].innerHTML;
            this.visitor.inp_namaobat.value = this.rows_els[this.selected_now].children[1].children[0].children[0].innerHTML;
            this.visitor.inp_satuan.value = this.rows_els[this.selected_now].children[2].children[0].innerHTML;
            this.visitor.harga = parseInt(this.rows_els[this.selected_now].children[3].children[0].innerHTML);
            document.body.removeChild(this.widget);
            visitor.select_harga();
        }
    }.bind(this);
    
    this.zero_data = function(n) {
        return {
            kode_obat: n,
            nama_obat: '',
            satuan: '',
            harga: ''
        }
    }
    
    
    this.table.focus();
}


var UpperPanel = function () {
    this.table = new Table(this);
    this.inp_tanggal = document.getElementById('inp_tanggal');
    this.inp_kodeobat = document.getElementById('inp_kodeobat');
    this.inp_namaobat = document.getElementById('inp_namaobat');
    this.inp_satuan = document.getElementById('inp_satuan');
    this.inp_harga = document.getElementById('inp_harga');
    this.inp_qty = document.getElementById('inp_qty');
    this.inp_subtot = document.getElementById('inp_subtot');
    this.entri = document.getElementById('entri');
    this.kode_obat = '';
    this.harga = 0;
    
    var today = function () {
        var d = new Date;
        if (d.getDate().toString().length === 2) {
            var date = d.getDate().toString();
        } else {
            var date = "0" + d.getDate().toString();
        }
        if (d.getMonth().toString().length === 2) {
            var month = d.getMonth().toString();
        } else {
            var month = "0" + d.getMonth().toString();
        }
        var year = (1900 + d.getYear()).toString();
        return year + '-' + month + '-' + date;
    }
    
    this.inp_tanggal.value = today();
    this.inp_namaobat.focus();
    
    this.inp_namaobat.onkeydown = function (e) {
        if(e.which === 13) {
            var retrieve = function (token, callback) {
                this.xhr = new XMLHttpRequest;
                this.xhr.onreadystatechange = function() {
                    if (this.xhr.readyState === 4 && this.xhr.status === 200) {
                        callback(JSON.parse(this.xhr.responseText));
                    }
                }.bind(this)
                this.xhr.open('GET', '/queryreq?key=' + token, true);
                this.xhr.send();
            }.bind(this);
            
            retrieve(e.target.value, function(res) {
                new CariObat(this, res);
            }.bind(this));
        }
    }.bind(this);
    
    this.select_harga = function () {
        var widget = document.createElement('div');
        widget.style = 'background-color:white; width:' + 
            this.inp_harga.getBoundingClientRect().width +
            'px; height:69px; position:absolute; left:' + 
            this.inp_harga.getBoundingClientRect().left + 'px; top:' + 
            this.inp_harga.getBoundingClientRect().top + 'px;';
        widget.tabIndex='1';
        document.body.appendChild(widget);
        
        var hv = document.createElement('div');
        hv.style = 'height:21px; border:solid 1px #aaaaaa; text-align:center';
        hv.innerHTML = 'HV';
        widget.appendChild(hv);
        
        var up = document.createElement('div');
        up.style = 'height:21px; border:solid 1px #aaaaaa; text-align:center';
        up.innerHTML = 'UPDS';
        widget.appendChild(up);
        
        var r = document.createElement('div');
        r.style = 'height:21px; border:solid 1px #aaaaaa; text-align:center';
        r.innerHTML = 'RESEP';
        widget.appendChild(r);
        
        var select_list = [hv, up, r]
        var selected = 0;
        
        hv.setAttribute('class', 'selected');
        
        var select_vis = function(){
            select_list.forEach(function(i){
                i.setAttribute('class', 'row');
            })
            select_list[selected].setAttribute('class', 'selected');
        }
        
        widget.onkeydown = function (e) {
            if (e.which === 38) {
                // UP
                if (selected > 0) {
                    selected = selected - 1;
                    select_vis();
                }
            } else if (e.which === 40) {
                // DOWN
                if (selected < 2) {
                    selected = selected + 1;
                    select_vis();
                }
            } else if (e.which === 13) {
                // ENTER
                if (selected === 0) {
                    this.inp_harga.value = parseInt(1.15 * this.harga);
                } else if (selected === 1) {
                    this.inp_harga.value = parseInt(1.25 * this.harga);
                } else if (selected === 2) {
                    this.inp_harga.value = parseInt(1.3 * this.harga);
                }
                document.body.removeChild(widget);
                this.inp_qty.focus();
            } else if (e.which === 27) {
                this.inp_harga.value = this.harga;
                document.body.removeChild(widget);
                this.inp_harga.focus();
            }
        }.bind(this);
        widget.focus();
    }.bind(this);
    
    this.inp_harga.onkeydown = function (e) {
        if (e.which === 13) {
            this.inp_qty.focus();
        }
    }.bind(this);
    
    this.clear_form = function () {
        this.inp_namaobat.value = '';
        this.inp_satuan.value = '';
        this.inp_qty.value = '';
        this.inp_harga.value = '';
        this.inp_subtot.value = '';
        this.kode_obat = '';
        this.harga = 0;
    }.bind(this);
    
    this.inp_qty.onkeydown = function (e) {
        if (e.which === 13) {
            this.inp_subtot.value = parseInt(this.inp_harga.value) * parseInt(this.inp_qty.value);
            this.entri.focus()
        }
    }.bind(this);
    
    this.entri.onclick = function () {
        this.table.add_data({
            kode_obat: this.inp_kodeobat.value,
            nama_obat: this.inp_namaobat.value,
            satuan: this.inp_satuan.value,
            qty: this.inp_qty.value,
            harga: this.inp_harga.value,
            subtotal: this.inp_subtot.value
        });
        this.table.rerender_data();
        this.clear_form();
    }.bind(this);
    
    this.entri.onkeydown = function (e) {
        if (e.which === 13) {
            this.table.add_data({
            kode_obat: this.inp_kodeobat.value,
            nama_obat: this.inp_namaobat.value,
            satuan: this.inp_satuan.value,
            qty: this.inp_qty.value,
            harga: this.inp_harga.value,
            subtotal: this.inp_subtot.value
        });
        this.table.rerender_data();
            this.clear_form();
            this.inp_namaobat.focus();
        }
        this.clear_form();
    }.bind(this);
}


var upper_panel = new UpperPanel();
