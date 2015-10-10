describe('DataGrid.TableHeader Test Suite', function() {

  var tableHeader;

  beforeEach(function() {
    tableHeader = new DataGrid.TableHeader();
  });

  afterEach(function() {
    tableHeader = null;
  });

  it('expect to be empty', function() {
    expect(tableHeader.getColumns().length).toBe(0);
  });

  it('expect to add a column', function() {

    tableHeader.addColumn('test');
  });

});