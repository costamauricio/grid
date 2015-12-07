/**
 * DataGrid.TableRow
 */
;(function(exports) {

  'use strict';

  var TableRow = function() {
    _setProperty(this, "aColumns", [], true);
  }

  TableRow.prototype = {

    /**
     * @param {DataGrid.TableColumn} oColumn
     */
    addColumn : function(oColumn) {

      if ( !(oColumn instanceof DataGrid.TableColumn) ) {
        throw "DataGrid.TableRow: Erro ao adicionar a coluna.";
      }

      this.aColumns.push(oColumn);
      return this;
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

    getColumns : function() {
      return this.aColumns;
    }
  }

  exports.TableRow = TableRow;
})(DataGrid);









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
  });
