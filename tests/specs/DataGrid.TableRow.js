describe('DataGrid.TableRow Test Suite', function() {

  var tableRow;

  beforeEach(function() {
    tableRow = new DataGrid.TableRow();
  });

  afterEach(function() {
    tableRow = null;
  });

  it('expect to have zero columns', function() {
    expect(tableRow.getColumns().length).toBe(0)
  });

  it('expect to throw exception on add new column', function() {
    expect(tableRow.addColumn).toThrow("DataGrid.TableRow: Erro ao adicionar a coluna.")
  });

  it('expect to add new column', function() {

    tableRow.addColumn(new DataGrid.TableColumn());
    expect(tableRow.getColumns().length).toBe(1);
  });

  it('expect to return column by index', function() {

    var tableColumn1 = new DataGrid.TableColumn(), tableColumn2 = new DataGrid.TableColumn();
    tableRow.addColumn(tableColumn1);
    tableRow.addColumn(tableColumn2);

    expect(tableRow.getColumnByIndex(0)).toBe(tableColumn1);
    expect(tableRow.getColumnByIndex(1)).not.toBe(tableColumn1);

  });

  it('expect to return HTMLTableRowElement', function() {
    expect(tableRow.getElement() instanceof HTMLTableRowElement).toBe(true);
  });

  it('expect to change style', function() {
    tableRow.setStyle('display', 'none');
    expect(tableRow.getElement().style.display).toBe('none');
  });

});