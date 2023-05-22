import React, { Component } from 'react';
import { Input, Radio, Row } from 'antd';
import InspectorStyles from './Inspector.css';
import { withTranslation } from '../../util';

const locatorStrategies = (driver) => {
  let baseLocatorStrategies = [
    ['id', 'Id'],
    ['xpath', 'XPath'],
    ['name', 'Name'],
    ['class name', 'Class Name'],
    ['accessibility id', 'Accessibility ID']
  ];
  if (['ios', 'mac'].includes(driver.client.capabilities.platformName.toLowerCase())) {
    baseLocatorStrategies.push(
      ['-ios predicate string', 'Predicate String'],
      ['-ios class chain', 'Class Chain']
    );
  } else if (driver.client.isAndroid) {
    if (driver.client.capabilities.automationName.toLowerCase() === 'espresso') {
      baseLocatorStrategies.push(
        ['-android datamatcher', 'DataMatcher'],
        ['-android viewtag', 'View Tag']
      );
    } else {
      baseLocatorStrategies.push(
        ['-android uiautomator', 'UIAutomator'],
      );
    }
  }
  return baseLocatorStrategies;
};

class ElementLocator extends Component {

  onSubmit () {
    const {locatedElements, locatorTestStrategy, locatorTestValue, searchForElement, clearSearchResults, hideLocatorTestModal} = this.props;
    if (locatedElements) {
      hideLocatorTestModal();
      clearSearchResults();
    } else {
      searchForElement(locatorTestStrategy, locatorTestValue);
    }
  }

  onCancel () {
    const {hideLocatorTestModal, clearSearchResults} = this.props;
    hideLocatorTestModal();
    clearSearchResults();
  }

  render () {
    const {
      setLocatorTestValue,
      locatorTestValue,
      setLocatorTestStrategy,
      locatorTestStrategy,
      driver,
      t,
    } = this.props;

    return <Row justify="center">
      <Radio.Group buttonStyle="solid"
        className={InspectorStyles.locatorStrategyGroup}
        onChange={(e) => setLocatorTestStrategy(e.target.value)}
        defaultValue={locatorTestStrategy}
      >
        <Row justify="center">
          {locatorStrategies(driver).map(([strategyValue, strategyName]) => (
            <Radio.Button value={strategyValue} key={strategyValue}>{strategyName}</Radio.Button>
          ))}
        </Row>
      </Radio.Group>
      <Input.TextArea
        className={InspectorStyles.locatorSelectorTextArea}
        placeholder={t('selector')}
        onChange={(e) => setLocatorTestValue(e.target.value)}
        value={locatorTestValue}
        allowClear={true}
        rows={3}
      />
    </Row>;
  }
}

export default withTranslation(ElementLocator);
