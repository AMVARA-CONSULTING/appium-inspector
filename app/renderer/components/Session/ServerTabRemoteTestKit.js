import {Col, Form, Input, Row} from 'antd';
import React from 'react';

import {INPUT} from '../../constants/ANTD_TYPES';

const ServerTabRemoteTestkit = ({server, setServerParam, t}) => (
  <Form>
    <Row gutter={8}>
      <Col span={24}>
        <Form.Item>
          <Input
            id="remoteTestKitAccessToken"
            type={INPUT.PASSWORD}
            addonBefore={t('RemoteTestKit AccessToken')}
            value={server.remotetestkit.token}
            onChange={(e) => setServerParam('token', e.target.value)}
          />
        </Form.Item>
      </Col>
    </Row>
  </Form>
);

export default ServerTabRemoteTestkit;
