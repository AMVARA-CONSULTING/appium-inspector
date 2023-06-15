import React from 'react';
import { Collapse, Form, Row, Col, Checkbox, Input } from 'antd';
import styles from './Session.css';

const { Panel } = Collapse;
const FormItem = Form.Item;

const AdvancedServerParams = ({ server, setServerParam, serverType, t }) => (
  <Row gutter={8}>
    <Col className={styles.advancedSettingsContainerCol}>
      <div className={styles.advancedSettingsContainer}>
        <Collapse bordered={true}>
          <Panel header={t('Advanced Settings')}>
            <Row>
              {serverType !== 'lambdatest' &&
              <Col span={7}>
                <FormItem>
                  <Checkbox checked={!!server.advanced.allowUnauthorized} onChange={(e) => setServerParam('allowUnauthorized', e.target.checked, 'advanced')}>{t('allowUnauthorizedCerts')}</Checkbox>
                </FormItem>
              </Col>}
              <Col span={5} align='right'>
                <FormItem>
                  <Checkbox checked={!!server.advanced.useProxy} onChange={(e) => setServerParam('useProxy', e.target.checked, 'advanced')}>{t('Use Proxy')}</Checkbox>
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem>
                  <Input disabled={!server.advanced.useProxy} onChange={(e) => setServerParam('proxy', e.target.value, 'advanced')}
                    placeholder={t('Proxy URL')} value={server.advanced.proxy} />
                </FormItem>
              </Col>
            </Row>
          </Panel>
        </Collapse>
      </div>
    </Col>
  </Row>
);

export default AdvancedServerParams;
