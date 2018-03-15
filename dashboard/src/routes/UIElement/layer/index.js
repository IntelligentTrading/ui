import React from "react";
import { layer } from "components";
import { Table, Row, Col, Button, Card } from "antd";

let Enum = {
  default: 1
};

const IcoPage = () => {
  const handleButtonClick = key => {
    if (key === Enum.default) {
      layer.open({
        title: "This is a layer",
        content: <div style={{ height: 360 }}>Some content here</div>
      });
    }
  };
  return (
    <div className="content-inner">
      <Row gutter={32}>
        <Col lg={8} md={12}>
          <Card title="默认">
            <Button
              type="primary"
              onClick={handleButtonClick.bind(null, Enum.default)}
            >
              Layer
            </Button>
          </Card>
        </Col>
      </Row>
      <h2 style={{ margin: "16px 0" }}>API</h2>
      <div style={{ margin: "16px 0" }}>
        <h2 style={{ margin: "4px 0" }}>layer.open(config)</h2>
        config<a
          href="https://ant.design/components/modal-cn/#API"
          target="_blank"
          rel="noopener noreferrer"
        >
          Modal
        </a>
        layer ID
      </div>
      <Row>
        <Col lg={18} md={24}>
          <Table
            rowKey={(record, key) => key}
            pagination={false}
            bordered
            scroll={{ x: 800 }}
            columns={[
              {
                title: "Props",
                dataIndex: "props"
              },
              {
                title: "Description",
                dataIndex: "desciption"
              },
              {
                title: "Type",
                dataIndex: "type"
              },
              {
                title: "Default",
                dataIndex: "default"
              }
            ]}
            dataSource={[
              {
                props: "content",
                desciption: "content",
                type: "string|ReactNode",
                default: "content"
              },
              {
                props: "title",
                desciption: "Test",
                type: "string|ReactNode",
                default: "Test"
              },
              {
                props: "confirmLoading",
                desciption: "loading",
                type: "boolean",
                default: "....load"
              },
              {
                props: "closable",
                desciption: "closable",
                type: "boolean",
                default: "closable"
              },
              {
                props: "onOk",
                desciption: "onOk",
                type: "function(e)",
                default: "onOk"
              },
              {
                props: "onCancel",
                desciption: "onCancel",
                type: "function(e)",
                default: '"onCancel"'
              },
              {
                props: "width",
                desciption: "width",
                type: "string|number",
                default: "520"
              },
              {
                props: "okText",
                desciption: "okText",
                type: "string",
                default: "okText"
              },
              {
                props: "cancelText",
                desciption: "cancelText",
                type: "string",
                default: "cancelText"
              },
              {
                props: "maskClosable",
                desciption: "maskClosable",
                type: "boolean",
                default: "true"
              },
              {
                props: "style",
                desciption: "style",
                type: "object",
                default: "-"
              },
              {
                props: "wrapClassName",
                desciption: "wrapClassName",
                type: "string",
                default: "-"
              }
            ]}
          />
        </Col>
      </Row>
      <div style={{ margin: "16px 0" }}>
        <h2 style={{ margin: "4px 0" }}>layer.close(index)</h2>
        index, layer; index layer
      </div>
      <div style={{ margin: "16px 0" }}>
        <h2 style={{ margin: "4px 0" }}>layer.closeAll()</h2>
        close all the layers
      </div>
    </div>
  );
};

export default IcoPage;
