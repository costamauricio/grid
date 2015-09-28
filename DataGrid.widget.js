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

  function _defineStyle(oObj, oStyles) {

    for (var sStyle in oStyles) {
      oObj.style[sStyle] = oStyles[sStyle];
    }
  }

  function _defineAttribute(oObj, oAttributes) {

    for (var sAttribute in oAttributes) {
      oObj.setAttribute(sAttribute, oAttributes[sAttribute]);
    }
  }

  /**
   * Responsável por renderizar e controlar as linhas da grid que estão visíveis no momento
   *
   * @naorela
   */
  var DataGridRowsRenderer = (function() {

    'use strict';

    var Renderer = function(oDataGrid, oElementScroll) {

      if ( !(oDataGrid instanceof DataGrid) ) {
        throw "DataGridRowsRenderer: Erro ao inicializar as linhas.";
      }

      _setProperty(this, "oDataGrid", oDataGrid, true);
      _setProperty(this, "oElementScroll", oElementScroll, true);
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
          blocks_in_cluster: 4
        }

        this.exploreEnvironment(this.oDataGrid.getRows());

        this.insertToDOM(this.oDataGrid.getRows());

        var iLastCluster = null,
            _this = this;

        this.oElementScroll.onscroll = function() {

          if (iLastCluster != (iLastCluster = _this.getClusterNum())) {
            _this.insertToDOM(_this.oDataGrid.getRows());
          }
        }
      },

      exploreEnvironment: function(aRows) {

        var opts = this.options;

        if (!aRows.length) {
          return;
        }

        if (this.oContent.children.length <= 1) {
          this.appendRows([aRows[0]]);
        }

        this.getRowsHeight(aRows);
      },

      getRowsHeight: function(aRows) {

        var opts = this.options;

        opts.cluster_height = 0;

        if (!aRows.length){
          return;
        }

        var nodes = this.oContent.children;

        opts.item_height = nodes[0].offsetHeight;

        opts.block_height = opts.item_height * opts.rows_in_block;
        opts.rows_in_cluster = opts.blocks_in_cluster * opts.rows_in_block;
        opts.cluster_height = opts.blocks_in_cluster * opts.block_height;
      },

      getClusterNum: function () {
        return Math.floor(this.oElementScroll.scrollTop / (this.options.cluster_height - this.options.block_height)) || 0;
      },

      generate: function (aRows, iCluster) {

        var opts = this.options,
            iRowsLength = aRows.length;

        if (iRowsLength < opts.rows_in_block) {
          return aRows;
        }

        if (!opts.cluster_height) {
          this.exploreEnvironment(aRows);
        }

        var items_start = Math.max((opts.rows_in_cluster - opts.rows_in_block) * iCluster, 0),
            items_end = items_start + opts.rows_in_cluster,
            top_space = items_start * opts.item_height,
            bottom_space = (iRowsLength - items_end) * opts.item_height,
            aClusterRows = [];

        top_space > 0 && aClusterRows.push( this.getExtraRow(top_space, aRows[0]) );

        for (var iRow = items_start; iRow < items_end; iRow++) {
          aRows[iRow] && aClusterRows.push(aRows[iRow]);
        }

        bottom_space > 0 && aClusterRows.push( this.getExtraRow(bottom_space, aRows[0]) );

        return aClusterRows;
      },

      getExtraRow: function(iHeight, oRowBase) {

        var oRow = new DataGrid.TableRow();
        iHeight && oRow.setStyle("height", iHeight + "px");

        for (var iColumn = 0; iColumn < oRowBase.getColumns().length; iColumn++) {

          var oColumn = new DataGrid.TableColumn("");
          oColumn.setStyle("width", oRowBase.getColumnByIndex(iColumn).getStyle("width"))
          oRow.addColumn(oColumn);
        }

        return oRow;
      },

      insertToDOM: function(aRows) {
        this.appendRows( this.generate(aRows, this.getClusterNum()) );
      },

      appendRows: function(aRows) {

        var oFragment = document.createDocumentFragment()

        for (var iRow = 0; iRow < aRows.length; iRow++) {
          oFragment.appendChild(aRows[iRow].getElement());
        }

        this.oContent.innerHTML = '';
        this.oContent.appendChild(oFragment);
      }
    };

    return Renderer;
  })();


  /**
   * Definição da DataGrid
   */

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
    _setProperty(this, "oHeader", new DataGrid.TableHeader(this));
    _setProperty(this, "oBody", new DataGrid.TableBody(this));
    _setProperty(this, "oFooter", new DataGrid.TableFooter(this));

    Object.defineProperty(this, 'hasCheckbox', {
      get : function() { return oConfiguracao.checkbox; },
      enumerable : true
    });

    var iWidth = new Number(oConfiguracao.width || window.getComputedStyle(this.oContainer)["width"].replace(/[^0-9]/g, '')),
        iColumns = 0;

    if (oConfiguracao.columns.width.length) {

      iColumns = oConfiguracao.columns.width.length;

    } else {
      throw "DataGrid: Quantidade de colunas não definida."
    }


    var aColumnsWidth = [],
        iWidthTotal = iWidth;

    if (this.hasCheckbox) {
      aColumnsWidth.push(25);
      iWidthTotal -= 25;
    }

    var aColumnsAuto = [];
    for (var iCol = 0; iCol < iColumns; iCol++) {

      var iWid = 0;

      if (oConfiguracao.columns.width[iCol] != undefined && oConfiguracao.columns.width[iCol] != null) {
        var t = new Number((oConfiguracao.columns.width[iCol]/100)*iWidthTotal);
        iWid = new Number(t.toFixed(0));
      } else {
        aColumnsAuto.push(iCol);
      }

      aColumnsWidth.push(iWid);
    }

    var iDiff = (iWidthTotal+25) - aColumnsWidth.reduce(function(x, y){ return x+y; });

    if (aColumnsAuto.length) {

    } else {
      aColumnsWidth[aColumnsWidth.length-1] += iDiff;
    }

    _setProperty(this, "aColumnsWidth", aColumnsWidth, true);
    Object.defineProperty(this, "aColumnsAlign", {
      get : function() { return oConfiguracao.columns.align; },
      enumerable : true
    });

    console.log(aColumnsWidth);

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

      var oDivHeader = document.createElement("div"),
          oDivBody = document.createElement("div"),
          oDivFooter = document.createElement("div"),
          oFragment = document.createDocumentFragment();

      oDivHeader.appendChild(this.oHeader.getElement());
      oDivBody.appendChild(this.oBody.getElement());
      oDivFooter.appendChild(this.oFooter.getElement());

      oDivBody.classList.add("datagrid-body");

      oDivHeader.style.width = iWidth + "px";
      oDivBody.style.width = iWidth + "px";
      oDivFooter.style.width = iWidth + "px";

      this.oBody.getElement().style.width = iWidth + "px";

      oFragment.appendChild(oDivHeader);
      oFragment.appendChild(oDivBody);
      oFragment.appendChild(oDivFooter);

      oDivBody.style.height = oConfiguracao.height + "px";
      oDivBody.style["overflow-y"] = "auto";
      oDivBody.style["overflow-x"] = "hidden";
      oDivBody.style["padding-right"] = 12 + "px";

      this.oContainer.appendChild(oFragment);

      _setProperty(this, "Renderer", new DataGridRowsRenderer(this, oDivBody));
      this.Renderer.init();

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

      _setProperty(this, "aColumns", [], true);
      _setProperty(this, "oDefinition", {
        style : {}
      }, true);
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

        return this.aColumns[iIndex];
      },

      setStyle : function(property, value) {

        this.hasOwnProperty("oElement") && (this.oElement.style[property] = value);
        this.oDefinition.style[property] = value;
        return this;
      },

      getColumns : function() {
        return this.aColumns;
      },

      getElement : function() {

        if (!this.hasOwnProperty("oElement")) {

          _setProperty(this, "oElement", document.createElement("tr"), true);
          _defineStyle(this.oElement, this.oDefinition.style);

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

    var TableColumn = function(conteudo) {

      _setProperty(this, "initialValue", conteudo);
      _setProperty(this, "oDefinition", {
        style : {},
        classes : [],
        attributes : {}
      }, true);
    }

    TableColumn.prototype = {

      /**
       * Seta o valor da coluna
       * @param {string|HTMLElement} value
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

      setStyle : function(property, value) {

        this.hasOwnProperty("oElement") && (this.oElement.style[property] = value);
        this.oDefinition.style[property] = value;
        return this;
      },

      getStyle : function(property) {

        if (this.hasOwnProperty("oElement")) {
          return this.oElement.style[property];
        }

        return this.oDefinition.style[property];
      },

      setAttribute : function(prop, value) {

        this.hasOwnProperty("oElement") && this.oElement.setAttribute(prop, value);
        this.oDefinition.attributes[prop] = value;
        return this;
      },

      addClass : function(sClassName) {

        this.hasOwnProperty("oElement") && this.oElement.classList.add(sClassName);
        this.oDefinition.classes.push(sClassName);
        return this;
      },

      removeClass : function(sClassname) {

        var oDef = this.oDefinition;

        this.hasOwnProperty("oElement") && this.oElement.classList.remove(sClassName);
        oDef.classes.indexOf(sClassName) && oDef.classes.splice(oDef.classes.indexOf(sClassName), 1);
        return this;
      },

      getElement : function() {

        if (!this.hasOwnProperty("oElement")) {

          _setProperty(this, "oElement", document.createElement("td"), true);
          _defineStyle(this.oElement, this.oDefinition.style);
          _defineAttribute(this.oElement, this.oDefinition.attributes);

          this.oElement.className = this.oDefinition.classes.join(' ');

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
      _setProperty(this, "oElement", document.createElement("table"), true);
      _setProperty(this, "aRows", [], true);
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

          var oColumn = new DataGrid.TableColumn("M");

          this.oDataGrid.aColumnsWidth[0] && oColumn.setStyle("width", this.oDataGrid.aColumnsWidth[0] + "px");
          oColumn.setStyle("text-align", "center");
          oRow.addColumn(oColumn);
        }

        for (var iRow = 0; iRow < aColumns.length; iRow++) {

          var oColumn = new DataGrid.TableColumn(aColumns[iRow]),
              iIndexRow = (this.oDataGrid.hasCheckbox ? iRow+1 : iRow);

          this.oDataGrid.aColumnsWidth[iIndexRow] && oColumn.setAttribute("width", this.oDataGrid.aColumnsWidth[iIndexRow] + "px");
          this.oDataGrid.aColumnsWidth[iIndexRow] && oColumn.setStyle("width", this.oDataGrid.aColumnsWidth[iIndexRow] + "px");
          oColumn.setStyle("text-align", (this.oDataGrid.aColumnsAlign[iRow] || "center"));
          oRow.addColumn(oColumn);
        }

        this.addRow(oRow);

        return oRow;
      },

      getRows : function() {
        return this.aRows;
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
      _setProperty(this, "oElement", document.createElement("table"), true);

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

          var oColumn = new DataGrid.TableColumn(oCheckbox);
          this.oDataGrid.aColumnsWidth[0] && oColumn.setStyle("width", this.oDataGrid.aColumnsWidth[0] + "px");
          oRow.addColumn(oColumn);
        }

        for (var iRow = 0; iRow < aColumns.length; iRow++) {

          var oColumn = new DataGrid.TableColumn(aColumns[iRow]),
              iIndexRow = (this.oDataGrid.hasCheckbox ? iRow+1 : iRow);

          this.oDataGrid.aColumnsWidth[iIndexRow] && oColumn.setStyle("width", this.oDataGrid.aColumnsWidth[iIndexRow] + "px");

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
      _setProperty(this, "oElement", document.createElement("table"), true);
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