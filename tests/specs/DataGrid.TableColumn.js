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

  it('expect to change style', function() {
    tableColumn.setStyle('display', 'none');
    expect(tableColumn.getStyle('display')).toBe('none');
    expect(tableColumn.getElement().style.display).toBe('none');

    // after 'oElement' populated
    expect(tableColumn.getStyle('display')).toBe('none');
  });

  it('expect to set an attribute', function() {

    tableColumn.setAttribute('test', 'test');
    expect(tableColumn.getElement().getAttribute('test')).toBe('test');
  });

  it('expect to manage CSS classes', function() {

    tableColumn.addClass('test');
    expect(tableColumn.getElement().classList.contains('test')).toBe(true);
    tableColumn.removeClass('test');
    expect(tableColumn.getElement().classList.contains('test')).toBe(false);
  });

  it('expect to return HTMLTableCellElement', function() {
    expect(tableColumn.getElement() instanceof HTMLTableCellElement).toBe(true);
  });

});