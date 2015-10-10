describe('DataGrid.TableColumn Test Suite', function() {

  var tableColumn;

  beforeEach(function() {
    tableColumn = new DataGrid.TableColumn();
  });

  afterEach(function() {
    tableColumn = null;
  });

  it('expect to set string value', function() {

    var value = 'test value';

    tableColumn.setValue(value);
    expect(tableColumn.getElement().innerHTML).toBe(value);

  });

  it('expect to set element value', function() {

    var value = document.createElement('test');

    tableColumn.setValue(value);
    expect(tableColumn.getElement().innerHTML).toBe('<test></test>');

  });

  it('expect to have fluent interface', function() {

    expect(tableColumn.setValue('')).toBe(tableColumn);
    expect(tableColumn.setValue(document.createElement('test'))).toBe(tableColumn);
    expect(tableColumn.setStyle('test', 'test')).toBe(tableColumn);
    expect(tableColumn.setAttribute('test', 'test')).toBe(tableColumn);
    expect(tableColumn.addClass('test')).toBe(tableColumn);
    expect(tableColumn.removeClass('test')).toBe(tableColumn);

  });

});