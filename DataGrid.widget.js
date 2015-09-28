(function(global) {

  'use strict';

  function _setProperty(oObj, sProperty, value, lEnumerable, lWritable, lConfigurable) {

    Object.defineProperty(oObj, sProperty, {
      value : value,
      enumerable : lEnumerable || false,
      writable : lWritable || false,
      configurable : lConfigurable || false
    });
  }

  /**
   * Responsável por renderizar e controlar as linhas da grid que estão visíveis no momento
   */
  var DataGridRowsRenderer = (function() {

    'use strict';

    function getStyle(prop, elem) {
      return window.getComputedStyle ? window.getComputedStyle(elem)[prop] : elem.currentStyle[prop];
    }

    var Renderer = function(oDataGrid) {

      if ( !(oDataGrid instanceof DataGrid) ) {
        throw "DataGridRowsRenderer: Erro ao inicializar as linhas.";
      }

      _setProperty(this, "oDataGrid", oDataGrid, true);
    }

    Renderer.prototype = {

      init : function() {

        _setProperty(this, "oContent", this.oDataGrid.getTableBody().getElement(), true);

        this.options = {
          item_height: 0,
          block_height: 0,
          rows_in_block: 50,
          rows_in_cluster: 0,
          cluster_height: 0,
          blocks_in_cluster: 4,
          content_tag: null,
          show_no_data_row: true
        }

        this.exploreEnvironment(this.oDataGrid.getRows());

        this.insertToDOM(this.oDataGrid.getRows());

        // this.oContent.scrollTop = scroll_top;

        var last_cluster = false,
            self = this;

        this.oContent.parentElement.parentElement.onscroll = function() {

          if (last_cluster != (last_cluster = self.getClusterNum())) {

            self.insertToDOM(self.oDataGrid.getRows());
          }
        }
      },

      exploreEnvironment: function(aRows) {

        var opts = this.options;

        if (!aRows.length) {
          return;
        }

        if (this.oContent.children.length <= 1) {
          this.html([aRows[0].getElement()]);
        }

        this.getRowsHeight(aRows);
      },

      getRowsHeight: function(aRows) {
        var opts = this.options,
          prev_item_height = opts.item_height;

        opts.cluster_height = 0;

        if (!aRows.length){
          return;
        }

        var nodes = this.oContent.children;

        opts.item_height = nodes[0].offsetHeight;
        // consider table's border-spacing
        if(getStyle('borderCollapse', this.oContent) != 'collapse')
          opts.item_height += parseInt(getStyle('borderSpacing', this.oContent)) || 0;

        opts.block_height = opts.item_height * opts.rows_in_block;
        opts.rows_in_cluster = opts.blocks_in_cluster * opts.rows_in_block;
        opts.cluster_height = opts.blocks_in_cluster * opts.block_height;

        return prev_item_height != opts.item_height;
      },

      getClusterNum: function () {
        return Math.floor(this.oContent.parentElement.parentElement.scrollTop / (this.options.cluster_height - this.options.block_height)) || 0;
      },

      generate: function (aRows, cluster_num) {
        var opts = this.options,
          rows_len = aRows.length;

        if (rows_len < opts.rows_in_block) {
          return aRows.map(function(oRow) {
            return oRow.getElement();
          });
        }

        if (!opts.cluster_height) {
          this.exploreEnvironment(aRows);
        }

        var items_start = Math.max((opts.rows_in_cluster - opts.rows_in_block) * cluster_num, 0),
          items_end = items_start + opts.rows_in_cluster,
          top_space = items_start * opts.item_height,
          bottom_space = (rows_len - items_end) * opts.item_height,
          this_cluster_rows = [],
          rows_above = items_start;
        if(top_space > 0) {
          // opts.keep_parity && this_cluster_rows.push(this.renderExtraTag('keep-parity'));
          this_cluster_rows.push(this.renderExtraTag('top-space', top_space));
        } else {
          rows_above++;
        }
        for (var i = items_start; i < items_end; i++) {
          aRows[i] && this_cluster_rows.push(aRows[i].getElement());
        }

        bottom_space > 0 && this_cluster_rows.push(this.renderExtraTag('bottom-space', bottom_space));

        return this_cluster_rows;
      },

      renderExtraTag: function(class_name, height) {
        var tag = document.createElement("tr"),
          clusterize_prefix = 'clusterize-';
        tag.className = [clusterize_prefix + 'extra-row', clusterize_prefix + class_name].join(' ');
        height && (tag.style.height = height + 'px');
        return tag;
      },

      insertToDOM: function(aRows) {

        var data = this.generate(aRows, this.getClusterNum());
            // outer_data = data.rows.join('');

        this.html(data);
      },

      html: function(aRows) {

        var oFragment = document.createDocumentFragment()

        for (var iRow = 0; iRow < aRows.length; iRow++) {
          oFragment.appendChild(aRows[iRow]);
        }

        this.oContent.innerHTML = '';
        this.oContent.appendChild(oFragment);
      }
    };

    return Renderer;
  })();

  var _oConfig = {
    width : null,
    height : 200,
    checkbox : false,
    columns : {
      width : [],
      align : []
    }
  };

  var DataGrid = function(oElemento, oConfig) {

    if ( !(oElemento instanceof Object) ) {
      throw "DataGrid: Elemento inválido.";
    }

    var oConfiguracao = {},
        lRenderizada = false;

    /**
     * Seta a configuração
     */
    for (var sConf in _oConfig) {


      oConfiguracao[sConf] = _oConfig[sConf];

      if (sConf == "columns") {

        for (var sSubConf in _oConfig[sConf]) {

          if (oConfig instanceof Object && oConfig.hasOwnProperty(sConf) && oConfig[sConf].hasOwnProperty(sSubConf)) {
            oConfiguracao[sConf][sSubConf] = oConfig[sConf][sSubConf];
          }
        }

        continue;
      }

      if (oConfig instanceof Object && oConfig.hasOwnProperty(sConf)) {
        oConfiguracao[sConf] = oConfig[sConf];
      }
    }

    _setProperty(this, "oContainer", oElemento, true);
    _setProperty(this, "oElement", document.createElement("table"), true);
    _setProperty(this, "oHeader", new DataGrid.TableHeader(this));
    _setProperty(this, "oBody", new DataGrid.TableBody(this));
    _setProperty(this, "oFooter", new DataGrid.TableFooter(this));

    Object.defineProperty(this, 'hasCheckbox', {
      get : function() { return oConfiguracao.checkbox; },
      enumerable : true
    });

    /**
     * Renderiza a Grid
     *
     * @throws
     * @return {DataGrid}
     */
    DataGrid.prototype.makeGrid = function() {

      if (lRenderizada) {
        throw "DataGrid: Grid já renderizada.";
      }

      // this.oHeader.getElement().style.display = "block";
      // this.oBody.getElement().style.display = "block";
      // this.oFooter.getElement().style.display = "block";

      // this.oBody.getElement().style.height = oConfiguracao.height + "px";
      // this.oBody.getElement().style["overflow-y"] = "auto";
      // this.oBody.getElement().style["overflow-x"] = "hidden";
      // this.oBody.getElement().style["padding-right"] = 12 + "px";
      var oElementScroll = document.createElement("div");
      oElementScroll.style.height = oConfiguracao.height + "px";
      oElementScroll.style["overflow-y"] = "auto";
      oElementScroll.style["overflow-x"] = "hidden";
      oElementScroll.style["padding-right"] = 12 + "px";

      // this.oElement.appendChild(this.oHeader.getElement());
      this.oElement.appendChild(this.oBody.getElement());
      // this.oElement.appendChild(this.oFooter.getElement());
      oElementScroll.appendChild(this.oElement);

      this.oContainer.appendChild(oElementScroll);

      var Renderer = new DataGridRowsRenderer(this);
      Renderer.init();

      lRenderizada = true;

      return this;
    }
  };

  /**
   * Definição da Grid
   */
  DataGrid.prototype = {

    addHeaderRow : function(aColumns) {
      return this.getTableHeader().newRow(aColumns);
    },

    /**
     * @return {DataGrid.TableRows[]}
     */
    getRows : function() {
      return this.getTableBody().getRows();
    },

    /**
     * Adiciona uma nova coluna na grid
     * @param {object[]|string[]} aColumns - Um array com o conteudo das colunas
     * @return {DataGrid.TableRow}
     */
    addRow : function(aColumns) {
      return this.getTableBody().newRow(aColumns);
    },

    getRowCount : function() {
      return this.getRows().length;
    },

    /**
     * @return {DataGrid.TableHeader}
     */
    getTableHeader : function() {
      return this.oHeader;
    },

    /**
     * @return {DataGrid.TableBody}
     */
    getTableBody : function() {
      return this.oBody;
    },

    /**
     * @return {DataGrid.TableFooter}
     */
    getTableFooter : function() {
      return this.oFooter;
    },

    /**
     * @return {Object}
     */
    getContainer : function() {
      return this.oContainer;
    }
  }

  /**
   * DataGrid.TableRow
   */
  ;(function(exports) {

    'use strict';

    var TableRow = function() {
      this.aColumns = [];
    }

    TableRow.prototype = {

      addColumn : function(oColumn) {

        if ( !(oColumn instanceof DataGrid.TableColumn) ) {
          throw "DataGrid.TableRow: Erro ao adicionar a coluna.";
        }

        this.aColumns.push(oColumn);
      },

      /**
       * Retorna a Coluna pelo indice
       *
       * @param  {integer} iIndex
       * @throw
       * @return {DataGrid.TableColumn}
       */
      getColumnByIndex : function(iIndex) {

        if (this.aColumns[iIndex] == undefined) {
          throw "DataGrid.TableRow: Indice indefinido.";
        }

        return this.aColumns[iindex];
      },

      getElement : function() {

        if (!this.hasOwnProperty("oElement")) {

          _setProperty(this, "oElement", document.createElement("tr"), true);

          for (var iColumn = 0; iColumn < this.aColumns.length; iColumn++) {
            this.oElement.appendChild(this.aColumns[iColumn].getElement());
          }
        }

        return this.oElement;
      }
    }

    exports.TableRow = TableRow;
  })(DataGrid);

  /**
   * DataGrid.TableColumn
   */
  ;(function(exports) {

    'use strict';

    var TableColumn = function(sElement, conteudo) {

      _setProperty(this, "sElement", sElement);
      _setProperty(this, "initialValue", conteudo);
    }

    TableColumn.prototype = {

      /**
       * Seta o valor da coluna
       * @param {string|object} value
       */
      setValue : function(value) {

        this.getElement().innerHTML = '';

        if (value instanceof HTMLElement) {

          this.getElement().appendChild(value);
          return TableColumn;
        }

        this.getElement().innerHTML = value;
        return TableColumn;
      },

      // setStyle : function(property, value) {

      //   this.oElement.style[property] = value;
      //   return this;
      // },

      // addClass : function(sClassName) {

      //   this.oElement.classList.add(sClassName);
      //   return this;
      // },

      getElement : function() {

        if (!this.hasOwnProperty("oElement")) {

          _setProperty(this, "oElement", document.createElement(this.sElement), true);
          this.setValue(this.initialValue);
        }

        return this.oElement;
      }
    }

    exports.TableColumn = TableColumn;
  })(DataGrid);

  /**
   * TableHeader
   */
  ;(function(exports) {

    'use strict';

    var TableHeader = function(oDataGrid) {

      if ( !(oDataGrid instanceof DataGrid) ) {
        throw "DataGrid.TableHeader: Erro ao criar o header.";
      }

      _setProperty(this, "oDataGrid", oDataGrid, true);
      _setProperty(this, "oElement", document.createElement("thead"), true);

      this.aRows = [];
    }

    TableHeader.prototype = {

      addRow : function(oRow) {

        if ( !(oRow instanceof DataGrid.TableHeader.Row) ) {
          throw "DataGrid.TableHeader.addRow: O objeto deve ser uma instancia de DataGrid.TableHeader.Row";
        }

        this.aRows.push(oRow);
        this.oElement.appendChild(oRow.getElement());

        return this;
      },

      newRow : function(aColumns) {

        if (aColumns.length == undefined) {
          throw "DataGrid.TableHeader.newRow: Nenhuma coluna informada.";
        }

        var oRow = new DataGrid.TableHeader.Row();

        if (this.oDataGrid.hasCheckbox) {

          var oColumn = new DataGrid.TableColumn("th", "M");
          oRow.addColumn(oColumn);
        }

        for (var iRow = 0; iRow < aColumns.length; iRow++) {

          var oColumn = new DataGrid.TableColumn("th", aColumns[iRow]);
          oRow.addColumn(oColumn);
        }

        this.addRow(oRow);

        return oRow;
      },

      getElement : function() {
        return this.oElement;
      }
    }

    /**
     * DataGrid.TableHead.Row --- Extends DataGrid.TableRow
     */
    ;(function(exports) {

      var Row = function() {
        DataGrid.TableRow.call(this);
      }

      Row.prototype = Object.create(DataGrid.TableRow.prototype);

      exports.Row = Row;
    })(TableHeader);

    exports.TableHeader = TableHeader;
  })(DataGrid);

  /**
   * DataGrid.TableBody
   */
  ;(function(exports) {

    'use strict';

    var TableBody = function(oDataGrid) {

      if ( !(oDataGrid instanceof DataGrid) ) {
        throw "DataGrid.TableBody: Erro ao criar o body.";
      }

      _setProperty(this, "oDataGrid", oDataGrid, true);
      _setProperty(this, "oElement", document.createElement("tbody"), true);

      this.aRows = [];
    }

    TableBody.prototype = {

      /**
       * Adiciona uma nova linha
       *
       * @param {DataGrid.TableBody.Row} oRow
       * @throws
       * @return {DataGrid.TableBody}
       */
      addRow : function(oRow) {

        if ( !(oRow instanceof DataGrid.TableBody.Row) ) {
          throw "DataGrid.TableBody.addRow: O objeto deve ser uma instancia de DataGrid.TableBody.Row";
        }

        this.aRows.push(oRow);

        return this;
      },

      /**
       * Cria uma nova linha a partir de um array
       *
       * @param  {Array}
       * @return {DataGrid.TableRow}
       */
      newRow : function(aColumns) {

        if (aColumns.length == undefined) {
          throw "Erro ao adicionar a linha.";
        }

        var oRow = new DataGrid.TableBody.Row();

        if (this.oDataGrid.hasCheckbox) {

          var oCheckbox = document.createElement("input");
          oCheckbox.type = "checkbox";

          var oColumn = new DataGrid.TableColumn("td", oCheckbox);
          oRow.addColumn(oColumn);
        }

        for (var iRow = 0; iRow < aColumns.length; iRow++) {

          var oColumn = new DataGrid.TableColumn("td", aColumns[iRow]);

          // oColumn.setStyle("white-space", "nowrap");
          oRow.addColumn(oColumn);
        }

        this.addRow(oRow);

        return oRow;
      },

      /**
       * Limpa o conteúdo
       */
      clearRows : function() {

        this.oElement.innerHTML = '';
        this.aRows = [];

        return this;
      },

      getRows : function() {
        return this.aRows;
      },

      /**
       * @return {Object}
       */
      getElement : function() {
        return this.oElement;
      }
    }

    /**
     * DataGrid.TableBody.Row  --- Extends DataGrid.TableRow
     */
    ;(function(exports) {

      var Row = function() {
        DataGrid.TableRow.call(this);
      }

      Row.prototype = Object.create(DataGrid.TableRow.prototype);

      Row.prototype.addSelection = function() {

      }

      exports.Row = Row;
    })(TableBody);

    exports.TableBody = TableBody;
  })(DataGrid);

  /**
   * TableFooter
   */
  ;(function(exports) {

    'use strict';

    var TableFooter = function(oDataGrid) {

      if ( !(oDataGrid instanceof DataGrid) ) {
        throw "Erro ao criar o header.";
      }

      _setProperty(this, "oDataGrid", oDataGrid, true);
      _setProperty(this, "oElement", document.createElement("tfoot"), true);
    }

    TableFooter.prototype = {

      getElement : function() {
        return this.oElement;
      }
    }

    exports.TableFooter = TableFooter;
  })(DataGrid);

  global.DataGrid = DataGrid;
})(this);