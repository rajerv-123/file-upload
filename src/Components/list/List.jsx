import React from "react";
import { Table, Button, Space } from "antd";
import { DeleteOutlined } from "@ant-design/icons"; // Import the delete icon

const List = () => {
  // Sample data for the table
  const data = [
    { key: "1", name: "File 1", type: "PDF", size: "2MB" },
    { key: "2", name: "File 2", type: "Image", size: "5MB" },
    { key: "3", name: "File 3", type: "Video", size: "10MB" },
  ];

  // Columns configuration for the table
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      filters: [
        { text: "PDF", value: "PDF" },
        { text: "Image", value: "Image" },
        { text: "Video", value: "Video" },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      sorter: (a, b) => parseFloat(a.size) - parseFloat(b.size),
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <Button type="danger" onClick={() => handleDelete(record)}>
            <DeleteOutlined /> {/* Delete icon */}
          </Button>
        </Space>
      ),
    },
  ];

  // Function to handle delete button click
  const handleDelete = (record) => {
    // Handle delete logic here
    console.log("Delete clicked for:", record);
  };

  return (
    <div style={{ padding: 20 }}>
      <Table
        dataSource={data}
        columns={columns}
        pagination={false}
        bordered
        size="middle"
        style={{ width: "100%", height: "calc(100vh - 200px)" }}
      />
    </div>
  );
};

export default List;
