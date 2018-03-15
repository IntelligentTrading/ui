import React from "react";
import { Search, Page } from "components";
import { Table, Row, Col, Card } from "antd";

const SearchPage = () => (
  <Page inner>
    <Row gutter={32}>
      <Col lg={8} md={12}>
        <Card title="Column here">
          <Search />
        </Card>
      </Col>
      <Col lg={8} md={12}>
        <Card title="Another">
          <Search
            {...{
              select: true,
              selectOptions: [
                { value: "components", name: "组件" },
                { value: "page", name: "页面" }
              ],
              selectProps: {
                defaultValue: "components"
              }
            }}
          />
        </Card>
      </Col>
      <Col lg={8} md={12}>
        <Card title="runner">
          <Search style={{ marginBottom: 16 }} />
          <Search size="small" />
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
            }
          ]}
        />
      </Col>
    </Row>
  </Page>
);

export default SearchPage;
