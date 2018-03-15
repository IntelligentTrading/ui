import React from "react";
import { DropOption, Page } from "components";
import { Table, Row, Col, Card, message } from "antd";

const DropOptionPage = () => (
  <Page inner>
    <Row gutter={32}>
      <Col lg={8} md={12}>
        <Card title="Title">
          <DropOption
            menuOptions={[
              { key: "1", name: "Ruby" },
              { key: "2", name: "Red" }
            ]}
          />
        </Card>
      </Col>
      <Col lg={8} md={12}>
        <Card title="Second">
          <DropOption
            menuOptions={[
              { key: "1", name: "Ruby" },
              { key: "2", name: "Red" }
            ]}
            buttonStyle={{ border: "solid 1px #eee", width: 60 }}
          />
        </Card>
      </Col>
      <Col lg={8} md={12}>
        <Card title="Third">
          <DropOption
            menuOptions={[
              { key: "1", name: "Ruby" },
              { key: "2", name: "Red" }
            ]}
            buttonStyle={{ border: "solid 1px #eee", width: 60 }}
            onMenuClick={({ key }) => {
              switch (key) {
                case "1":
                  message.success("Ruby");
                  break;
                case "2":
                  message.success("Red");
                  break;
                default:
                  break;
              }
            }}
          />
        </Card>
      </Col>
    </Row>
    <h2 style={{ margin: "16px 0" }}>Props</h2>
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
              title: "Title",
              dataIndex: "default"
            }
          ]}
          dataSource={[
            {
              props: "menuOptions",
              desciption: "[{name:string,key:string}]",
              type: "Array",
              default: "Some Array"
            },
            {
              props: "onMenuClick",
              desciption: "menuitem  {item, key, keyPath}",
              type: "Function",
              default: "-"
            },
            {
              props: "buttonStyle",
              desciption: "Second",
              type: "Object",
              default: "-"
            },
            {
              props: "dropdownProps",
              desciption: "Dropdown",
              type: "Object",
              default: "-"
            }
          ]}
        />
      </Col>
    </Row>
  </Page>
);

export default DropOptionPage;
