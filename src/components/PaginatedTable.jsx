import { useEffect, useState } from "react";
import { Table } from "antd";

/**
 * Reusable server-side paginated table.
 * Contract for fetchData:
 *  - input: { page: number, size: number }
 *  - output: { items: any[], total: number, page?: number, size?: number }
 */
const PaginatedTable = ({
  columns,
  fetchData,
  rowKey = "id",
  initialPage = 1,
  initialSize = 10,
  onDataLoaded,
  ...tableProps
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: initialPage,
    pageSize: initialSize,
    total: 0,
  });

  const load = async (page = initialPage, size = initialSize) => {
    setLoading(true);
    try {
      const res = await fetchData({ page, size });
      const items = res?.items ?? [];
      const total = res?.total ?? 0;
      setData(items);
      setPagination({ current: page, pageSize: size, total });
      onDataLoaded && onDataLoaded({ items, total, page, size, raw: res });
    } catch (error) {
      // Let parent handle message if needed
      console.error("PaginatedTable: load data failed", error);
      setData([]);
      setPagination((p) => ({ ...p, current: page, pageSize: size }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(pagination.current, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTableChange = (pag /*, filters, sorter, extra */) => {
    const { current, pageSize } = pag;
    load(current, pageSize);
  };

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey={rowKey}
      loading={loading}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: true,
        showTotal: (total) => `Tổng ${total} mục`,
      }}
      onChange={handleTableChange}
      {...tableProps}
    />
  );
};

export default PaginatedTable;
