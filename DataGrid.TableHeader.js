  /**
   * TableHeader
   */
  ;(function(exports) {

    'use strict';

    /**
     * Pega o próximo ID da coluna
     * @param  {DataGrid.TableHeader} oTableHeader
     * @return {String}
     */
    function _getNextColumnId(oTableHeader) {
      return String.fromCharCode(65 + oTableHeader.getColumns().length);
    }

    /**
     * Calcula o tamanho das colunas baseado no tamanho disponível
     */
    function _updateColumnsWidth(oTableHeader) {

      var iWidth = oTableHeader.oDataGrid.width - (oTableHeader.oDataGrid.hasCheckbox ? DataGrid.iCheckboxWidth : 0);

      /**
       * Primeiro calcula todas as colunas com tamanho fixo
       */
      var aColumns = oTableHeader.getColumns().filter(function(oColumn) {

        var width = new String(oColumn.getWidth() || '');

        if (width == '' || width.match(/^\d*$|^\d*\%$/)) {
          return true;
        }

        iWidth -= new Number(width.replace(/[^\d]/g, ''));
        oColumn.setStyle("width", width + '');
        return false;
      });

      /**
       * Agora calcula todas as colunas com tamanho relativo
       */
      var iWidthCalc = 0;

      aColumns = aColumns.filter(function(oColumn) {

        if (oColumn.getWidth()) {

          var width = parseInt( (+oColumn.getWidth().replace(/[^\d]/g, ''))/100 * iWidth );
          oColumn.setStyle("width", width + "px");

          iWidthCalc += width;
          return false;
        }

        return true;
      });

      iWidth -= iWidthCalc;

      /**
       * Agora calcula todas as colunas com tamanho automático (que não tenha tamanho setado)
       */
      if (aColumns.length) {

        var iWidthAuto = parseInt(iWidth/aColumns.length);

        for (var iCol = 0; iCol < aColumns.length; iCol++) {
          aColumns[iCol].setStyle("width", iWidthAuto + "px");
        }

        iWidth -= (iWidthAuto*aColumns.length);
      }

      /**
       * Caso o calculo tenha resultado em alguma diferença com o tqamanho total, joga esta diferença na última coluna
       * da grid, ou na última coluna que tenha tamanho altomático (quando disponível)
       */
      if (iWidth != 0) {

        var oColumn = oTableHeader.getColumns()[oTableHeader.getColumns().length-1];

        if (aColumns.length) {
          oColumn = aColumns[aColumns.length-1];
        }

        oColumn.setStyle("width", (+oColumn.getStyle("width").replace(/[^\d]/g, '') + iWidth) + "px");
      }
    }

    /**
     * Cria a linha das colunas
     *
     * @param  {DataGrid.TableHeader} TableHeader
     * @return {DataGrid.TableHeader.Row}
     */
    function _createColumnsRow(TableHeader) {

      var oRow = new DataGrid.TableHeader.Row(),
          aColumns = TableHeader.getColumns();

      for (var iCol = 0; iCol < aColumns.length; iCol++) {
        oRow.addColumn(aColumns[iCol]);
      }

      return oRow;
    }

    /**
     * Cria a linha dos grupos das colunas
     *
     * @param  {DataGrid.TableHeader} TableHeader
     * @return {DataGrid.TableHeader.Row}
     */
    function _createGroupColumnsRow(TableHeader) {

      if (!TableHeader.aColumnGroups.length) {
        return null;
      }

      var oRow = new DataGrid.TableHeader.Row(),
          aColumns = TableHeader.getColumns(),
          lastGroup = null,
          iColspan = 1;

      for (var iCol = 0; iCol < aColumns.length; iCol++) {

        var aGroupColumn = TableHeader.aColumnGroups.filter(function(oGroup) {

          var aColumn = oGroup.aColumns.filter(function(oColumn) {
            return oColumn == aColumns[iCol];
          });

          return (aColumn.length > 0);
        })

        var group = '';

        if (aGroupColumn.length) {

          if (aGroupColumn[0].name == lastGroup) {

            oRow.getColumns().length && oRow.getColumns()[oRow.getColumns().length-1].setAttribute("colspan", ++iColspan);
            continue;
          }

          group = aGroupColumn[0].name;
        }

        var oColumn = new DataGrid.TableHeader.Column(group);
        oRow.addColumn(oColumn);
        lastGroup = group;
        iColspan = 1;
      }

      return oRow;
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
       * @param {String}|{HTMLElement} content
       * @param {Object} oConfig
       * @return {DataGrid.TableHeader.Column}
       */
      addColumn : function(content, oConfig) {

        var oColumn = new DataGrid.TableHeader.Column(content, oConfig);
        (!oColumn.getId()) && oColumn.setId( _getNextColumnId(this) );

        this.aColumns.push(oColumn);
        _updateColumnsWidth(this);

        return oColumn;
      },

      /**
       * Adiciona um agrupamento de colunas
       * @param {String}|{HTMLElement} group
       * @param {DataGrid.TableHeader.Column[]} aColumns
       * @return {DataGrid.TableHeader}
       */
      addColumnGroup : function(group, aColumns) {

        var oGroup = {
          name : group,
          aColumns : []
        };

        for (var iCol = 0; iCol < aColumns.length; iCol++) {

          if ( !(aColumns[iCol] instanceof DataGrid.TableHeader.Column) ) {
            throw "DataGrid.TableHeader.addColumnGroup: A Coluna deve ser uma instancia de DataGrid.TableHeader.Column";
          }

          oGroup.aColumns.push(aColumns[iCol]);
        }

        this.aColumnGroups.push(oGroup);
        return this;
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
      addRow : function(oRow, checkboxContent) {

        if ( !(oRow instanceof DataGrid.TableHeader.Row) ) {
          throw "DataGrid.TableHeader.addRow: O objeto deve ser uma instancia de DataGrid.TableHeader.Row";
        }

        if (this.oDataGrid.hasCheckbox) {
          oRow.addCheckboxColumn(checkboxContent || '');
        }

        this.aRows.push(oRow);

        return this;
      },

      /**
       * @return {HTMLElement}
       */
      getElement : function() {

        if (!this.hasOwnProperty("oElement")) {

          _setProperty(this, "oElement", document.createElement("table"), true);

          var oRowGroup = _createGroupColumnsRow(this),
              oRowColumns = _createColumnsRow(this),
              checkboxContent = '',
              _this = this;

          /**
           * Caso a grid tenha checkbox, define o conteúdo da coluna
           */
          if (this.oDataGrid.hasCheckbox) {

            checkboxContent = "M";

            if (this.oDataGrid.hasSelectAll) {

              checkboxContent = document.createElement("a");
              checkboxContent.innerHTML = "M";

              checkboxContent.onclick = function() {
                _this.oDataGrid.getTableBody().selectAll();
              }
            }
          }

          oRowGroup && this.addRow(oRowGroup);
          oRowColumns && this.addRow(oRowColumns, checkboxContent);

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

      Row.prototype = _extends(Object.create(DataGrid.TableRow.prototype), {

        /**
         * Adiciona a coluna responsável pelo checkbox no início da linha
         *
         * @param {String}|{HTMLElement} content
         * @return {DataGrid.TableHeader.Column}
         */
        addCheckboxColumn : function(content) {

          var oColumn = new DataGrid.TableHeader.Column(content);
          this.aColumns.splice(0, 0, oColumn);

          oColumn.addClass("datagrid-checkbox-column");

          return oColumn;
        }
      });

      exports.Row = Row;
    })(TableHeader);

    /**
     * DataGrid.TableHeader.Column --- Extends DataGrid.TableColumn
     */
    ;(function(exports) {
      'use strict';

      /**
       * Configuração da coluna
       *
       * _oConfig.id    -- Identificador da coluna
       * _oConfig.width -- Largura ("100px" | 20 | "20%")
       * _oConfig.align -- Alinhamento ("right" | "left" | "center")
       * _oConfig.wrap  -- Se o texto da célula deve ter quebra de linha
       */
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

      Column.prototype = _extends(Object.create(DataGrid.TableColumn.prototype), {

        getId : function() {
          return this.oConfig.id;
        },

        setId : function(sId) {
          this.oConfig.id = sId;
          return this;
        },

        wrap : function() {
          return this.oConfig.wrap;
        },

        getWidth : function() {
          return this.oConfig.width;
        },

        getAlign : function() {
          return this.oConfig.align;
        }
      });

      exports.Column = Column;
    })(TableHeader);

    exports.TableHeader = TableHeader;
  })(DataGrid);
