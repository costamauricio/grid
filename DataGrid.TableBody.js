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

        if (this.oDataGrid.hasCheckbox) {
          oRow.addCheckboxColumn();
        }

        this.aRows.push(oRow);

        return this;
      },

      /**
       * Cria uma nova linha a partir de um array ou um objeto
       *
       * @param  {Array}|{Object}
       * @throws
       * @return {DataGrid.TableBody.Row}
       */
      parseRow : function(columns) {

        var aColumns = this.oDataGrid.getTableHeader().getColumns(),
            oRow = new DataGrid.TableBody.Row();

        /**
         * Gera a partir de um array
         */
        if (Object.prototype.toString.call(columns) == "[object Array]") {

          for (var iCol = 0; iCol < aColumns.length; iCol++) {

            var oColumn = new DataGrid.TableColumn(columns[iCol] || '');

            oColumn.setStyle("width", aColumns[iCol].getStyle("width"));
            oRow.addColumn(oColumn);
          }

          this.addRow(oRow);
          return oRow;
        }

        /**
         * Gera a partir de um objeto
         */
        if (Object.prototype.toString.call(columns) == "[object Object]") {

          for (var iCol = 0; iCol < aColumns.length; iCol++) {

            var oColumn = new DataGrid.TableColumn(columns[aColumns[iCol].getId()] || '');

            oColumn.setStyle("width", aColumns[iCol].getStyle("width"));
            oRow.addColumn(oColumn);
          }

          this.addRow(oRow);
          return oRow;
        }

        throw "DataGrid.TableBody.parseRow: Erro ao criar linha.";
      },

      /**
       * Limpa o conteúdo
       */
      clearRows : function() {

        this.oElement.innerHTML = '';
        this.aRows = [];

        return this;
      },

      /**
       * @todo Implementar
       */
      selectAll : function() {

        if (!this.oDataGrid.hasCheckbox) {
          return false;
        }

        for (var iRow = 0; iRow < this.aRows.length; iRow++) {
          var oCheckbox = this.aRows[iRow].getColumns()[0].getElement().children[0];

          oCheckbox.checked = !oCheckbox.checked;
        }
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

      Row.prototype = _extends(Object.create(DataGrid.TableRow.prototype), {

        /**
         * Adiciona a coluna responsável pelo checkbox no início da linha
         *
         * @return {DataGrid.TableHeader.Column}
         */
        addCheckboxColumn : function() {

          var oCheckbox = document.createElement("input");
          oCheckbox.type = "checkbox";

          var oColumn = new DataGrid.TableColumn(oCheckbox);
          this.aColumns.splice(0, 0, oColumn);

          oColumn.addClass("datagrid-checkbox-column");

          return oColumn;
        },

        selectRow : function() {

        }
      });

      exports.Row = Row;
    })(TableBody);

    exports.TableBody = TableBody;
  })(DataGrid);
