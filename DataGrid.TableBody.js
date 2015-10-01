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
