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
