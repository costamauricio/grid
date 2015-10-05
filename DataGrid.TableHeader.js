  /**
   * TableHeader
   */
  ;(function(exports) {

    'use strict';

    var iWidthCheckboxColumn = 25,
        _columnRange = {
          start : 65,
          end : 90
        };

    function _getNextColumnId(oTableHeader) {
      return String.fromCharCode(_columnRange.start + oTableHeader.getColumns().length);
    }

    /**
     * Calcula o tamanho das colunas
     * @todo  Refatorar [muto sono]
     */
    function _updateColumnsWidth(oTableHeader) {

      var iWidth = oTableHeader.oDataGrid.width - (oTableHeader.oDataGrid.hasCheckbox ? iWidthCheckboxColumn : 0),
          iWidthTotal = iWidth;

      var aColumns = oTableHeader.getColumns().filter(function(oColumn) {

        var width = new String(oColumn.getWidth() || '');

        if (width == '' || width.match(/^\d*$/)) {
          return true;
        }

        iWidth -= new Number(width.replace(/[^\d]/g, ''));
        oColumn.setStyle("width", width + '');
        return false;
      });

      var iCalc = 0;
      aColumns = aColumns.filter(function(oColumn) {

        if (oColumn.getWidth()) {
          var width = parseInt( (+oColumn.getWidth())/100 * iWidth );
          oColumn.setStyle("width", width + "px");

          iCalc += width;
          return false;
        }

        return true;
      });

      if (aColumns.length) {

        iWidth -= iCalc;
        iCalc = 0;
        for (var iCol = 0; iCol < aColumns.length; iCol++) {
          var width = parseInt(iWidth/aColumns.length);
          iCalc += width;
          aColumns[iCol].setStyle("width", width + "px");
        }
        iWidth -= iCalc;
      }

      if (iWidth != 0) {
        var oColumn = oTableHeader.getColumns()[oTableHeader.getColumns().length-1];

        if (aColumns.length) {
          oColumn = aColumns[aColumns.length-1];
        }

        oColumn.setStyle("width", (+oColumn.getStyle("width").replace(/[^\d]/g, '')+iWidth) + "px");
      }
    }

    var TableHeader = function(oDataGrid) {

      if ( !(oDataGrid instanceof DataGrid) ) {
        throw "DataGrid.TableHeader: Erro ao criar o header.";
      }

      _setProperty(this, "oDataGrid", oDataGrid, true);
      _setProperty(this, "aRows", [], true);
      _setProperty(this, "aColumns", []);
      _setProperty(this, "aColumnGroups", []);
    }

    TableHeader.prototype = {

      /**
       * Adiciona uma nova coluna
       *
       * @param {String|HTMLElement} content
       * @param {Object} oConfig
       */
      addColumn : function(content, oConfig) {

        var oColumn = new DataGrid.TableHeader.Column(content, oConfig);
        (!oColumn.getId()) && oColumn.setId( _getNextColumnId(this) );

        this.aColumns.push(oColumn);
        _updateColumnsWidth(this);

        return oColumn;
      },

      addColumnGroup : function(sGroup, aRows) {

      },

      /**
       * @return {DataGrid.TableHeader.Column[]}
       */
      getColumns : function() {
        return this.aColumns;
      },

      /**
       * Adiciona uma linha ao header
       * @throws
       * @param {DataGrid.TableHeader.Row} oRow
       * @return {DataGrid.TableHeader}
       */
      addRow : function(oRow) {

        if ( !(oRow instanceof DataGrid.TableHeader.Row) ) {
          throw "DataGrid.TableHeader.addRow: O objeto deve ser uma instancia de DataGrid.TableHeader.Row";
        }

        if (this.oDataGrid.hasCheckbox) {
          oRow.addCheckboxColumn('');
        }

        this.aRows.push(oRow);

        return this;
      },

      getElement : function() {

        if (!this.hasOwnProperty("oElement")) {

          _setProperty(this, "oElement", document.createElement("table"), true);

          var oRow = new DataGrid.TableHeader.Row();
          for (var iCol = 0; iCol < this.aColumns.length; iCol++) {
            oRow.addColumn(this.aColumns[iCol]);
          }

          if (this.oDataGrid.hasCheckbox) {
            oRow.addCheckboxColumn("M").setStyle("width", iWidthCheckboxColumn + "px")
          }

          this.aRows.push(oRow);

          for (var iRow = 0; iRow < this.aRows.length; iRow++) {
            this.oElement.appendChild(this.aRows[iRow].getElement());
          }
        }

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

      Row.prototype.addCheckboxColumn = function(content) {

        var oColumn = new DataGrid.TableHeader.Column(content);
        this.aColumns.splice(0, 0, oColumn);

        return oColumn;
      }

      exports.Row = Row;
    })(TableHeader);

    /**
     * DataGrid.TableHeader.Column --- Extends DataGrid.TableColumn
     */
    ;(function(exports) {
      'use strict';

      var _oConfig = {
        id : null,
        width : null,
        align : "left",
        wrap : false
      }

      var Column = function(conteudo, oConfig) {

        DataGrid.TableColumn.call(this, conteudo);
        _setProperty(this, "oConfig", _defineConfig(_oConfig, (oConfig || {})) );
      }

      Column.prototype = Object.create(DataGrid.TableColumn.prototype);

      Column.prototype.getId = function() {
        return this.oConfig.id;
      };

      Column.prototype.setId = function(sId) {
        this.oConfig.id = sId;
        return this;
      }

      Column.prototype.wrap = function() {
        return this.oConfig.wrap;
      }

      Column.prototype.getWidth = function() {
        return this.oConfig.width;
      }

      Column.prototype.getAlign = function() {
        return this.oConfig.align;
      }

      exports.Column = Column;
    })(TableHeader);

    exports.TableHeader = TableHeader;
  })(DataGrid);
