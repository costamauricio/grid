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

      setAttribute : function(attr, value) {

        this.hasOwnProperty("oElement") && this.oElement.setAttribute(attr, value);
        this.oDefinition.attributes[attr] = value;
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
