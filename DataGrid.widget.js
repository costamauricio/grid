(function(global) {

  'use strict';

  var _oConfig, DataGridRowsRenderer, DataGrid;

  global._setProperty = function(oObj, sProperty, value, lEnumerable, lWritable, lConfigurable) {

    Object.defineProperty(oObj, sProperty, {
      value        : value,
      enumerable   : lEnumerable   || false,
      writable     : lWritable     || false,
      configurable : lConfigurable || false
    });
  }

  global._defineStyle = function(oObj, oStyles) {

    for (var sStyle in oStyles) {
      oObj.style[sStyle] = oStyles[sStyle];
    }
  }

  global._defineAttribute = function (oObj, oAttributes) {

    for (var sAttribute in oAttributes) {
      oObj.setAttribute(sAttribute, oAttributes[sAttribute]);
    }
  }

  /**
   * Seta a configura��o baseado nos valores passados e no default
   *
   * @param  {Object} oConfigDefault -- Valores padr�es
   * @param  {Object} oConfig -- Valores que ser�o definidos
   * @return {Object} -- Configura��o final
   */
  global._defineConfig = function(oConfigDefault, oConfig) {

    var o = {};

    for (var sConf in oConfigDefault) {

      o[sConf] = oConfigDefault[sConf];
      oConfig.hasOwnProperty(sConf) && (o[sConf] = oConfig[sConf]);
    }

    return o;
  }

  global._extends = function(oObj, oExt) {

    for (var sProp in oExt) {
      oObj[sProp] = oExt[sProp];
    }

    return oObj;
  }

  /**
   * Respons�vel por renderizar e controlar as linhas da grid que est�o vis�veis no momento
   *
   * @naorela
   * @serio_naorela
   * @don't_touch
   */
  DataGridRowsRenderer = (function() {

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

        _setProperty(this, "oContainer", this.oDataGrid.getTableBody().getElement(), true);

        this.options = {
          item_height: 0,
          block_height: 0,
          rows_in_block: 25,
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

        if (this.oContainer.children.length <= 1) {
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

        var nodes = this.oContainer.children;

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

        var oFragment = document.createDocumentFragment();

        for (var iRow = 0; iRow < aRows.length; iRow++) {
          oFragment.appendChild(aRows[iRow].getElement());
        }

        this.oContainer.innerHTML = '';
        this.oContainer.appendChild(oFragment);
      }
    };

    return Renderer;
  })();


  /**
   * Defini��o da DataGrid
   *
   * _oConfig.width     -- Largura
   * _oConfig.height    -- Altura
   * _oConfig.checkbox  -- Checkbox nas linhas
   * _oConfig.selectAll -- Bot�o no header para selecionar todas as linhas
   */
  _oConfig = {
    width : null,
    height : 200,
    checkbox : false,
    selectAll : false
  };

  DataGrid = function(oElemento, oConfig) {

    if ( !(oElemento instanceof HTMLElement) ) {
      throw "DataGrid: Elemento inv�lido.";
    }

    oElemento.classList.add("datagrid-container");

    var oConfiguracao = _defineConfig(_oConfig, (oConfig || {})),
        lRenderizada = false,
        iWidth = new String(oConfiguracao.width || window.getComputedStyle(oElemento)["width"]).replace(/[^0-9]/g, '');

    iWidth = new Number(iWidth);

    if (iWidth == NaN || iWidth < 1) {
      throw "DataGrid: Largura n�o especificada.";
    }

    Object.defineProperty(this, "hasCheckbox", {
      get : function() { return oConfiguracao.checkbox; },
      enumerable : true
    });

    Object.defineProperty(this, "hasSelectAll", {
      get : function() { return oConfiguracao.selectAll; },
      enumerable : true
    });

    _setProperty(this, "width", iWidth, true);
    _setProperty(this, "oContainer", oElemento, true);
    _setProperty(this, "oHeader", new DataGrid.TableHeader(this));
    _setProperty(this, "oBody",   new DataGrid.TableBody(this));
    _setProperty(this, "oFooter", new DataGrid.TableFooter(this));

    /**
     * Renderiza a Grid
     *
     * @throws
     * @return {DataGrid}
     */
    DataGrid.prototype.makeGrid = function() {

      if (lRenderizada) {
        throw "DataGrid: Grid j� renderizada.";
      }

      /**
       * Declarando variaveis
       */
      var oDivHeader    = document.createElement("div"),
          oDivBody      = document.createElement("div"),
          oDivFooter    = document.createElement("div"),
          oSubContainer = document.createElement("div"),
          oTableHeader  = this.oHeader.getElement(),
          oTableBody    = this.oBody.getElement(),
          oTableFooter  = this.oFooter.getElement();

      oDivHeader.appendChild(oTableHeader);
      oDivBody.appendChild(oTableBody);
      oDivFooter.appendChild(oTableFooter);

      /**
       * Definindo Classes para melhorar o uso de css
       */
      oTableHeader.classList.add("datagrid-table");
      oTableBody.classList.add("datagrid-table");
      oTableFooter.classList.add("datagrid-table");

      oDivHeader.classList.add("datagrid-head");
      oDivBody.classList.add("datagrid-body");
      oDivFooter.classList.add("datagrid-foot");

      /**
       * Definindo o tamanhos da grid
       */
      oTableHeader.style.width = iWidth + "px";
      oTableBody.style.width = iWidth + "px";
      oTableFooter.style.width = iWidth + "px";

      oDivHeader.style.width = iWidth + "px";
      oDivBody.style.width = iWidth + "px";
      oDivFooter.style.width = iWidth + "px";

      /**
       * Adicionando os Elementos ao fragmento
       */
      oSubContainer.appendChild(oDivHeader);
      oSubContainer.appendChild(oDivBody);
      oSubContainer.appendChild(oDivFooter);

      /**
       * @TODO Controle da altura
       */
      oDivBody.style.height = oConfiguracao.height + "px";
//      oDivBody.style["overflow"] = "hidden";

      /**
       * Adiciona o fragmento ao Container
       */
      this.oContainer.appendChild(oSubContainer);

      _setProperty(this, "Renderer", new DataGridRowsRenderer(this, oDivBody));
      this.Renderer.init();

      lRenderizada = true;

      return this;
    }
  };

  /**
   * Define o tamanho da coluna do checkbox
   * @type {Number}
   */
  DataGrid.iCheckboxWidth = 25;

  /**
   * Defini��o da Grid
   */
  DataGrid.prototype = {

    /**
     * Adiciona uma coluna a grid
     *
     * @param {String|HTMLElement} content
     * @param {Object} oColumn
     *
     * {
     *   oColumn.id    -- ID da coluna (default [A-Z])
     *   oColumn.width -- Tamanho da coluna, caso seja especificado sem medida ser� calculado em porcentagem (default null)
     *   oColumn.align -- Alinhamento da coluna (default left)
     *   oColumn.wrap  -- Caso permita que a coluna tenha quebra de texto (default false)
     * }
     *
     * @return {DataGrid.TableHeader.Column}
     */
    addColumn : function(content, oConfig) {
      return this.getTableHeader().addColumn(content, oConfig);
    },

    /**
     * Cria um grupo de colunas
     * @param {String}|{HTMLElement} content
     * @param {DataGrid.TableHeader.Column[]} aColumns
     */
    addColumnGroup : function (content, aColumns) {
      this.getTableHeader().addColumnGroup(content, aColumns);
      return this;
    },

    /**
     * Adiciona uma linha a grid
     * @param {Object}|{Array} columns
     * @return {DataGrid.TableBody.Row}
     */
    addRow : function(columns) {
      return this.getTableBody().parseRow(columns);
    },

    /**
     * @return {DataGrid.TableRows[]}
     */
    getRows : function() {
      return this.getTableBody().getRows();
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
     * @return {HTMLElement}
     */
    getContainer : function() {
      return this.oContainer;
    }
  }

  global.DataGrid = DataGrid;
})(this);
