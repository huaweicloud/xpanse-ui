/*
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: Huawei Inc.
 */

import { Button, Col, Form, Row, Select, Tabs, Tooltip, Typography } from 'antd';
import { Tab } from 'rc-tabs/lib/interface';
import React, { useEffect, useMemo, useState } from 'react';
import { To, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import appStyles from '../../../../styles/app.module.css';
import serviceOrderStyles from '../../../../styles/service-order.module.css';
import tableStyles from '../../../../styles/table.module.css';
import {
    AvailabilityZoneConfig,
    DeployRequest,
    ServiceFlavor,
    ServiceProviderContactDetails,
    UserOrderableServiceVo,
} from '../../../../xpanse-api/generated';
import { orderPageRoute, servicesSubPageRoute } from '../../../utils/constants';
import { ContactDetailsShowType } from '../../common/ocl/ContactDetailsShowType';
import { ContactDetailsText } from '../../common/ocl/ContactDetailsText';
import { BillingModeSelection } from '../common/BillingModeSelection';
import { FlavorInfo } from '../common/FlavorInfo';
import { RegionInfo } from '../common/RegionInfo';
import { ServiceHostingSelection } from '../common/ServiceHostingSelection';
import { AvailabilityZoneFormItem } from '../common/availabilityzone/AvailabilityZoneFormItem';
import { OrderSubmitProps } from '../common/utils/OrderSubmitProps';
import useGetAvailabilityZonesForRegionQuery from '../common/utils/useGetAvailabilityZonesForRegionQuery';
import { convertAreasToTabs } from '../formDataHelpers/areaHelper';
import { getBillingModes, getDefaultBillingMode } from '../formDataHelpers/billingHelper';
import { getContactServiceDetailsOfServiceByCsp } from '../formDataHelpers/contactServiceDetailsHelper';
import { getCspListForVersion } from '../formDataHelpers/cspHelper';
import { getDeployParams } from '../formDataHelpers/deployParamsHelper';
import { getEulaByCsp } from '../formDataHelpers/eulaHelper';
import { getServiceFlavorList } from '../formDataHelpers/flavorHelper.ts';
import { getAvailabilityZoneRequirementsForAService } from '../formDataHelpers/getAvailabilityZoneRequirementsForAService';
import { getRegionDropDownValues } from '../formDataHelpers/regionHelper';
import { getAvailableServiceHostingTypes } from '../formDataHelpers/serviceHostingTypeHelper';
import { getSortedVersionList } from '../formDataHelpers/versionHelper';
import CspSelect from '../formElements/CspSelect';
import { RegionDropDownInfo } from '../types/RegionDropDownInfo';
import NavigateOrderSubmission from './NavigateOrderSubmission';

export function SelectServiceForm({ services }: { services: UserOrderableServiceVo[] }): React.JSX.Element {
    const { Paragraph } = Typography;
    const [form] = Form.useForm();
    const [urlParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const latestVersion = decodeURI(urlParams.get('latestVersion') ?? '');
    const serviceName = decodeURI(urlParams.get('serviceName') ?? '');
    const categoryName = decodeURI(urlParams.get('catalog') ?? '');

    const servicePageUrl = servicesSubPageRoute + categoryName;
    let serviceInfo: OrderSubmitProps | undefined;
    const versionToServicesMap = useMemo<Map<string, UserOrderableServiceVo[]>>(() => {
        const currentVersions: Map<string, UserOrderableServiceVo[]> = new Map<string, UserOrderableServiceVo[]>();
        for (const service of services) {
            if (service.version) {
                if (!currentVersions.has(service.version)) {
                    currentVersions.set(
                        service.version,
                        services.filter((data) => data.version === service.version)
                    );
                }
            }
        }
        return currentVersions;
    }, [services]);

    // if the component is revisited by the customer after going to final order submission page, the user selected values are set as URL state.
    // These values must be read and set in the form again by default.
    if (location.state) {
        serviceInfo = location.state as OrderSubmitProps;
    }
    const versionList: { value: string; label: string }[] = getSortedVersionList(versionToServicesMap);
    const [selectVersion, setSelectVersion] = useState<string>(serviceInfo ? serviceInfo.version : latestVersion);
    let cspList: UserOrderableServiceVo.csp[] = getCspListForVersion(selectVersion, versionToServicesMap);
    const [selectCsp, setSelectCsp] = useState<UserOrderableServiceVo.csp>(
        serviceInfo ? (serviceInfo.csp as UserOrderableServiceVo.csp) : cspList[0]
    );

    let serviceHostTypes: UserOrderableServiceVo.serviceHostingType[] = getAvailableServiceHostingTypes(
        selectCsp,
        versionToServicesMap.get(selectVersion)
    );
    const [selectServiceHostType, setSelectServiceHostType] = useState<UserOrderableServiceVo.serviceHostingType>(
        serviceInfo
            ? (serviceInfo.serviceHostingType as UserOrderableServiceVo.serviceHostingType)
            : serviceHostTypes[0]
    );
    let areaList: Tab[] = convertAreasToTabs(selectCsp, selectServiceHostType, versionToServicesMap.get(selectVersion));
    const [selectArea, setSelectArea] = useState<string>(serviceInfo ? serviceInfo.area : areaList[0].key);
    let regionList: RegionDropDownInfo[] = getRegionDropDownValues(
        selectCsp,
        selectServiceHostType,
        selectArea,
        versionToServicesMap.get(selectVersion)
    );
    const [selectRegion, setSelectRegion] = useState<string>(serviceInfo ? serviceInfo.region : regionList[0].value);
    const [selectAvailabilityZones, setSelectAvailabilityZones] = useState<Record<string, string>>(
        serviceInfo?.availabilityZones ?? {}
    );

    let flavorList: ServiceFlavor[] = getServiceFlavorList(
        selectCsp,
        selectServiceHostType,
        versionToServicesMap.get(selectVersion)
    );
    const [selectFlavor, setSelectFlavor] = useState<string>(serviceInfo ? serviceInfo.flavor : flavorList[0].name);

    let billingModes: DeployRequest.billingMode[] | undefined = getBillingModes(
        selectCsp,
        selectServiceHostType,
        versionToServicesMap.get(selectVersion)
    );
    const defaultBillingMode: DeployRequest.billingMode | undefined = getDefaultBillingMode(
        selectCsp,
        selectServiceHostType,
        versionToServicesMap.get(selectVersion)
    );
    const [selectBillingMode, setSelectBillMode] = useState<DeployRequest.billingMode>(
        serviceInfo
            ? serviceInfo.billingMode
            : defaultBillingMode
              ? defaultBillingMode
              : billingModes
                ? billingModes[0]
                : DeployRequest.billingMode.FIXED
    );

    let currentServiceProviderContactDetails: ServiceProviderContactDetails | undefined =
        getContactServiceDetailsOfServiceByCsp(selectCsp, versionToServicesMap.get(selectVersion));
    const currentEula: string | undefined = getEulaByCsp(selectCsp, versionToServicesMap.get(selectVersion));

    const getAvailabilityZonesForRegionQuery = useGetAvailabilityZonesForRegionQuery(selectCsp, selectRegion);
    const availabilityZoneConfigs: AvailabilityZoneConfig[] = getAvailabilityZoneRequirementsForAService(
        selectCsp,
        services
    );

    // Side effect needed to update initial state when data from backend is available.
    useEffect(() => {
        if (!serviceInfo?.availabilityZones) {
            if (getAvailabilityZonesForRegionQuery.isSuccess && getAvailabilityZonesForRegionQuery.data.length > 0) {
                if (availabilityZoneConfigs.length > 0) {
                    const defaultSelection: Record<string, string> = {};
                    availabilityZoneConfigs.forEach((availabilityZoneConfig) => {
                        if (availabilityZoneConfig.mandatory) {
                            defaultSelection[availabilityZoneConfig.varName] =
                                getAvailabilityZonesForRegionQuery.data[0];
                        }
                    });
                    setSelectAvailabilityZones(defaultSelection);
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getAvailabilityZonesForRegionQuery.isSuccess, getAvailabilityZonesForRegionQuery.data]);

    const onChangeServiceHostingType = (serviceHostingType: UserOrderableServiceVo.serviceHostingType) => {
        location.state = undefined;
        setSelectServiceHostType(serviceHostingType);
    };

    const onChangeFlavor = (newFlavor: string) => {
        setSelectFlavor(newFlavor);
        billingModes = getBillingModes(selectCsp, selectServiceHostType, versionToServicesMap.get(selectVersion));
        setSelectBillMode(
            defaultBillingMode ? defaultBillingMode : billingModes ? billingModes[0] : DeployRequest.billingMode.FIXED
        );
    };

    const onChangeRegion = (value: string) => {
        setSelectRegion(value);
    };

    const onChangeAreaValue = (newArea: string) => {
        setSelectArea(newArea);
        const currentRegionList = getRegionDropDownValues(
            selectCsp,
            selectServiceHostType,
            newArea,
            versionToServicesMap.get(selectVersion)
        );
        regionList = currentRegionList;
        setSelectRegion(currentRegionList[0]?.value ?? '');
    };

    const onChangeVersion = (currentVersion: string) => {
        cspList = getCspListForVersion(currentVersion, versionToServicesMap);
        serviceHostTypes = getAvailableServiceHostingTypes(cspList[0], versionToServicesMap.get(currentVersion));
        areaList = convertAreasToTabs(cspList[0], serviceHostTypes[0], versionToServicesMap.get(currentVersion));
        regionList = getRegionDropDownValues(
            cspList[0],
            selectServiceHostType,
            areaList[0]?.key ?? '',
            versionToServicesMap.get(currentVersion)
        );
        flavorList = getServiceFlavorList(cspList[0], selectServiceHostType, versionToServicesMap.get(currentVersion));
        billingModes = getBillingModes(cspList[0], serviceHostTypes[0], versionToServicesMap.get(currentVersion));
        currentServiceProviderContactDetails = getContactServiceDetailsOfServiceByCsp(
            cspList[0],
            versionToServicesMap.get(currentVersion)
        );
        setSelectArea(areaList[0].key);
        setSelectFlavor(flavorList[0].name);
        setSelectRegion(regionList[0].value);
        setSelectVersion(currentVersion);
        setSelectCsp(cspList[0]);
        setSelectServiceHostType(serviceHostTypes[0]);
        setSelectBillMode(
            defaultBillingMode ? defaultBillingMode : billingModes ? billingModes[0] : DeployRequest.billingMode.FIXED
        );
    };

    const onChangeCloudProvider = (csp: UserOrderableServiceVo.csp) => {
        serviceHostTypes = getAvailableServiceHostingTypes(csp, versionToServicesMap.get(selectVersion));
        areaList = convertAreasToTabs(csp, serviceHostTypes[0], versionToServicesMap.get(selectVersion));
        regionList = getRegionDropDownValues(
            csp,
            serviceHostTypes[0],
            areaList[0]?.key ?? '',
            versionToServicesMap.get(selectVersion)
        );
        flavorList = getServiceFlavorList(csp, serviceHostTypes[0], versionToServicesMap.get(selectVersion));
        billingModes = getBillingModes(csp, serviceHostTypes[0], versionToServicesMap.get(selectVersion));
        currentServiceProviderContactDetails = getContactServiceDetailsOfServiceByCsp(
            csp,
            versionToServicesMap.get(selectVersion)
        );
        serviceHostTypes = getAvailableServiceHostingTypes(csp, versionToServicesMap.get(selectVersion));
        setSelectCsp(csp);
        setSelectArea(areaList[0]?.key ?? '');
        setSelectRegion(regionList[0]?.value ?? '');
        setSelectFlavor(flavorList[0]?.name ?? '');
        setSelectServiceHostType(serviceHostTypes[0]);
        setSelectBillMode(
            defaultBillingMode ? defaultBillingMode : billingModes ? billingModes[0] : DeployRequest.billingMode.FIXED
        );
    };

    function onAvailabilityZoneChange(varName: string, availabilityZone: string | undefined) {
        if (availabilityZone !== undefined) {
            setSelectAvailabilityZones((prevState: Record<string, string>) => ({
                ...prevState,
                [varName]: availabilityZone,
            }));
        } else {
            const newAvailabilityZone = selectAvailabilityZones;
            delete newAvailabilityZone[varName];
            setSelectAvailabilityZones({ ...newAvailabilityZone });
        }
    }

    function isAvailabilityZoneRequired(): boolean {
        return availabilityZoneConfigs.filter((availabilityZoneConfig) => availabilityZoneConfig.mandatory).length > 0;
    }

    const gotoOrderSubmit = function () {
        const orderSubmitParams: OrderSubmitProps = getDeployParams(
            versionToServicesMap.get(selectVersion) ?? [],
            selectCsp,
            selectServiceHostType,
            { name: selectRegion, area: selectArea },
            selectFlavor,
            currentServiceProviderContactDetails,
            selectAvailabilityZones,
            currentEula,
            selectBillingMode
        );

        navigate(
            orderPageRoute
                .concat('?serviceName=', orderSubmitParams.name)
                .concat('&version=', orderSubmitParams.version)
                .concat('#', orderSubmitParams.category),
            {
                state: orderSubmitParams,
            }
        );
    };

    return (
        <>
            <Form
                form={form}
                layout='vertical'
                autoComplete='off'
                initialValues={{ selectRegion, selectFlavor }}
                onFinish={gotoOrderSubmit}
                validateTrigger={['gotoOrderSubmit']}
            >
                <div>
                    <NavigateOrderSubmission text={'<< Back'} to={servicePageUrl as To} props={undefined} />
                    <div className={serviceOrderStyles.Line} />
                </div>
                <div className={tableStyles.genericTableContainer}>
                    <Row justify='start' gutter={10}>
                        <Col span={6}>
                            <Tooltip placement='topLeft' title={serviceName}>
                                <Paragraph ellipsis={true} className={appStyles.contentTitle}>
                                    Service: {serviceName}
                                </Paragraph>
                            </Tooltip>
                        </Col>
                        {currentServiceProviderContactDetails !== undefined ? (
                            <Col span={4}>
                                <ContactDetailsText
                                    serviceProviderContactDetails={currentServiceProviderContactDetails}
                                    showFor={ContactDetailsShowType.Order}
                                />
                            </Col>
                        ) : (
                            <></>
                        )}
                    </Row>
                    <div className={serviceOrderStyles.orderFormSelectionStyle}>
                        Version:&nbsp;
                        <Select
                            value={selectVersion}
                            className={serviceOrderStyles.versionDropDown}
                            onChange={onChangeVersion}
                            options={versionList}
                        />
                    </div>

                    <br />
                    <CspSelect
                        selectCsp={selectCsp}
                        cspList={cspList}
                        onChangeHandler={(csp: UserOrderableServiceVo.csp) => {
                            onChangeCloudProvider(csp);
                        }}
                    />
                    <br />
                    <ServiceHostingSelection
                        serviceHostingTypes={serviceHostTypes}
                        updateServiceHostingType={onChangeServiceHostingType}
                        disabledAlways={false}
                        previousSelection={selectServiceHostType}
                    ></ServiceHostingSelection>
                    <br />
                    <br />
                    <div className={`${serviceOrderStyles.orderFormSelectionStyle} ${appStyles.contentTitle}`}>
                        <Tabs
                            type='card'
                            size='middle'
                            activeKey={selectArea}
                            tabPosition={'top'}
                            items={areaList}
                            onChange={(area) => {
                                onChangeAreaValue(area);
                            }}
                        />
                    </div>
                    <RegionInfo selectRegion={selectRegion} onChangeRegion={onChangeRegion} regionList={regionList} />
                    {availabilityZoneConfigs.map((availabilityZoneConfig) => {
                        return (
                            <AvailabilityZoneFormItem
                                availabilityZoneConfig={availabilityZoneConfig}
                                selectRegion={selectRegion}
                                onAvailabilityZoneChange={onAvailabilityZoneChange}
                                selectAvailabilityZones={selectAvailabilityZones}
                                selectCsp={selectCsp}
                                key={availabilityZoneConfig.varName}
                            />
                        );
                    })}
                    <BillingModeSelection
                        selectBillingMode={selectBillingMode}
                        setSelectBillingMode={setSelectBillMode}
                        billingModes={billingModes}
                    />
                    <FlavorInfo selectFlavor={selectFlavor} flavorList={flavorList} onChangeFlavor={onChangeFlavor} />
                </div>
                <div>
                    <div className={serviceOrderStyles.Line} />
                    <div className={serviceOrderStyles.orderParamItemRow}>
                        <div className={serviceOrderStyles.orderParamItemLeft} />
                        <div className={serviceOrderStyles.orderParamSubmit}>
                            <Button
                                type='primary'
                                htmlType='submit'
                                disabled={
                                    getAvailabilityZonesForRegionQuery.isError ||
                                    (isAvailabilityZoneRequired() &&
                                        getAvailabilityZonesForRegionQuery.data?.length === 0)
                                }
                            >
                                &nbsp;&nbsp;Next&nbsp;&nbsp;
                            </Button>
                        </div>
                    </div>
                </div>
            </Form>
        </>
    );
}
