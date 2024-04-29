import {
  AimOutlined,
  ClearOutlined,
  CopyOutlined,
  HourglassOutlined,
  LoadingOutlined,
  SendOutlined,
} from '@ant-design/icons';
import {Alert, Button, Col, Input, Row, Spin, Table, Tooltip} from 'antd';
import _ from 'lodash';
import React, {useRef} from 'react';

import {ALERT, ROW} from '../../constants/antd-types';
import {LINKS} from '../../constants/common';
import {NATIVE_APP} from '../../constants/session-inspector';
import {clipboard, shell} from '../../polyfills';
import styles from './Inspector.css';

/**
 * Shows details of the currently selected element and shows methods that can
 * be called on the elements (tap, sendKeys)
 */
const SelectedElement = (props) => {
  const {
    applyClientMethod,
    currentContext,
    getFindElementsTimes,
    findElementsExecutionTimes,
    isFindingElementsTimes,
    selectedElement,
    selectedElementId,
    elementInteractionsNotAvailable,
    selectedElementSearchInProgress,
    t,
  } = props;

  const sendKeys = useRef();

  const isDisabled = selectedElementSearchInProgress || isFindingElementsTimes;

  const selectedElementTableCell = (text, copyToClipBoard) => {
    const textString = String(text);
    if (copyToClipBoard) {
      return (
        <div className={styles['selected-element-table-cells']}>
          <Tooltip title={t('Copied!')} trigger="click">
            <span
              className={styles['element-cell-copy']}
              onClick={() => clipboard.writeText(textString.replace(/(?:\r\n|\r|\n)/g, '\\n'))}
            >
              {!textString ? textString : textString.replace(/(?:\r\n|\r|\n)/g, '\\n')}
            </span>
          </Tooltip>
        </div>
      );
    } else {
      return <div className={styles['selected-element-table-cells']}>{textString}</div>;
    }
  };

  const locatorStrategyDocsLink = (name, docsLink) => (
    <span>
      {name}
      <strong>
        <a onClick={(e) => e.preventDefault() || shell.openExternal(docsLink)}>
          <br />
          (docs)
        </a>
      </strong>
    </span>
  );

  // Get the columns for the attributes table
  let attributeColumns = [
    {
      title: t('Attribute'),
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      render: (text) => selectedElementTableCell(text, false),
    },
    {
      title: t('Value'),
      dataIndex: 'value',
      key: 'value',
      render: (text) => selectedElementTableCell(text, true),
    },
  ];

  // Get the data for the attributes table
  let dataSource = _.toPairs(selectedElement.attributes).map(([key, value]) => ({
    key,
    value,
    name: key,
  }));
  dataSource.unshift({
    key: 'elementId',
    value: selectedElementSearchInProgress ? <Spin /> : selectedElementId,
    name: 'elementId',
  });

  // Get the columns for the strategies table
  let findColumns = [
    {
      title: t('Find By'),
      dataIndex: 'find',
      key: 'find',
      fixed: 'left',
      render: (text) => selectedElementTableCell(text, false),
    },
    {
      title: t('Selector'),
      dataIndex: 'selector',
      key: 'selector',
      render: (text) => selectedElementTableCell(text, true),
    },
  ];

  if (findElementsExecutionTimes.length > 0) {
    findColumns.push({
      title: t('Time'),
      dataIndex: 'time',
      key: 'time',
      fixed: 'right',
      render: (text) => selectedElementTableCell(text, false),
    });
  }

  // Get the data for the strategies table
  let findDataSource = selectedElement.strategyMap.map(([key, selector]) => ({
    key,
    selector,
    find: key,
  }));

  // Add documentation links to supported strategies
  for (const locator of findDataSource) {
    switch (locator.key) {
      case '-ios class chain':
        locator.find = locatorStrategyDocsLink(locator.key, LINKS.CLASS_CHAIN_DOCS);
        break;
      case '-ios predicate string':
        locator.find = locatorStrategyDocsLink(locator.key, LINKS.PREDICATE_DOCS);
        break;
      case '-android uiautomator':
        locator.find = locatorStrategyDocsLink(locator.key, LINKS.UIAUTOMATOR_DOCS);
        break;
    }
  }

  // If XPath is the only optimal selector, warn the user about its brittleness
  const showXpathWarning = findDataSource.length === 1;

  // Replace table data with table data that has the times
  if (findElementsExecutionTimes.length > 0) {
    findDataSource = findElementsExecutionTimes;
  }

  let tapIcon = <AimOutlined />;
  if (!(elementInteractionsNotAvailable || selectedElementId) || selectedElementSearchInProgress) {
    tapIcon = <LoadingOutlined />;
  }

  return (
    <div>
      {elementInteractionsNotAvailable && (
        <Row type={ROW.FLEX} gutter={10} className={styles.selectedElemNotInteractableAlertRow}>
          <Col>
            <Alert type={ALERT.INFO} message={t('interactionsNotAvailable')} showIcon />
          </Col>
        </Row>
      )}
      <Row justify="center" type={ROW.FLEX} align="middle" className={styles.elementActions}>
        <Tooltip title={t('Tap')}>
          <Button
            disabled={isDisabled}
            icon={tapIcon}
            id="btnTapElement"
            onClick={() => applyClientMethod({methodName: 'click', elementId: selectedElementId})}
          />
        </Tooltip>
        <Button.Group className={styles.elementKeyInputActions}>
          <Input
            className={styles.elementKeyInput}
            disabled={isDisabled}
            placeholder={t('Enter Keys to Send')}
            allowClear={true}
            onChange={(e) => (sendKeys.current = e.target.value)}
          />
          <Tooltip title={t('Send Keys')}>
            <Button
              disabled={isDisabled}
              id="btnSendKeysToElement"
              icon={<SendOutlined />}
              onClick={() =>
                applyClientMethod({
                  methodName: 'sendKeys',
                  elementId: selectedElementId,
                  args: [sendKeys.current || ''],
                })
              }
            />
          </Tooltip>
          <Tooltip title={t('Clear')}>
            <Button
              disabled={isDisabled}
              id="btnClearElement"
              icon={<ClearOutlined />}
              onClick={() => applyClientMethod({methodName: 'clear', elementId: selectedElementId})}
            />
          </Tooltip>
        </Button.Group>
        <Button.Group>
          <Tooltip title={t('Copy Attributes to Clipboard')}>
            <Button
              disabled={isDisabled}
              id="btnCopyAttributes"
              icon={<CopyOutlined />}
              onClick={() => clipboard.writeText(JSON.stringify(dataSource))}
            />
          </Tooltip>
          <Tooltip title={t('Get Timing')}>
            <Button
              disabled={isDisabled}
              id="btnGetTiming"
              icon={<HourglassOutlined />}
              onClick={() => getFindElementsTimes(findDataSource)}
            />
          </Tooltip>
        </Button.Group>
      </Row>
      {findDataSource.length > 0 && (
        <Row className={styles.selectedElemContentRow}>
          <Spin spinning={isFindingElementsTimes}>
            <Table
              columns={findColumns}
              dataSource={findDataSource}
              size="small"
              scroll={{x: 'max-content'}}
              pagination={false}
            />
          </Spin>
        </Row>
      )}
      <br />
      {currentContext === NATIVE_APP && showXpathWarning && (
        <div>
          <Alert message={t('usingXPathNotRecommended')} type={ALERT.WARNING} showIcon />
          <br />
        </div>
      )}
      {dataSource.length > 0 && (
        <Row className={styles.selectedElemContentRow}>
          <Table
            columns={attributeColumns}
            dataSource={dataSource}
            size="small"
            scroll={{x: 'max-content'}}
            pagination={false}
          />
        </Row>
      )}
    </div>
  );
};

export default SelectedElement;
