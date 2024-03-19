import React from "react";
import { Table, Button, Space } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { deleteFile } from "../Redux/actions";

const List = () => {
  const filesObject = useSelector((state) => state.files);
  const dispatch = useDispatch();
  const files = filesObject && filesObject.files;

  const handleDelete = (record) => {
    dispatch(deleteFile(record.name));
  };

  if (!Array.isArray(files)) {
    console.error("Files is not an array:", files);
    return null;
  }

  const dataSource = files.map((file, index) => ({
    key: index.toString(),
    name: file.name,
    type: file.type,
    size: file.size,
  }));

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
            <DeleteOutlined />
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Table
        dataSource={dataSource}
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
