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
          //oColumn.setStyle("width", "25" + "px");//Trocado por css
          oColumn.getElement().classList.add("datagrid-checkbox-column");
          oRow.addColumn(oColumn);
        }

        for (var iCol = 0; iCol < aColumns.length; iCol++) {

          var oColumn = new DataGrid.TableColumn(aColumns[iCol]);

          oColumn.setStyle("width", this.oDataGrid.getTableHeader().getColumns()[iCol].getStyle("width"));

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
