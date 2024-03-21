import React from "react";
import { Table, Button, Space, Card } from "antd";
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
    number: index + 1,
    name: file.name,
    type: file.type,
    size: file.size,
  }));

  const columns = [
    {
      title: "#",
      dataIndex: "number",
      key: "number",
      align: "center",
      width: 50,
    },
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
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: 20,
      }}
    >
      <Card
        title="File List"
        style={{
          width: "80%",
          height: "calc(100vh - 200px)",
          borderRadius: 10,
          boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            overflowY: "auto",
          }}
        >
          <Table
            dataSource={dataSource}
            columns={columns}
            pagination={false}
            bordered
            size="middle"
            scroll={{ y: "calc(100vh - 310px)" }}
            style={{ borderRadius: 10 }}
          />
        </div>
      </Card>
    </div>
  );
};

export default List;
