/*
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: Huawei Inc.
 */

import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, Row, Tooltip } from 'antd';
import React, { useRef, useState } from 'react';
import { Navigate, To, useLocation, useNavigate } from 'react-router-dom';
import { v4 } from 'uuid';
import serviceOrderStyles from '../../../../styles/service-order.module.css';
import tableStyles from '../../../../styles/table.module.css';
import { DeployRequest, taskStatus } from '../../../../xpanse-api/generated';
import {
    createServicePageRoute,
    CUSTOMER_SERVICE_NAME_FIELD,
    homePageRoute,
    servicesSubPageRoute,
} from '../../../utils/constants';
import { ApiDoc } from '../../common/doc/ApiDoc';
import { isHandleKnownErrorResponse } from '../../common/error/isHandleKnownErrorResponse.ts';
import { ContactDetailsShowType } from '../../common/ocl/ContactDetailsShowType.ts';
import { ContactDetailsText } from '../../common/ocl/ContactDetailsText.tsx';
import { useLatestServiceOrderStatusQuery } from '../../common/queries/useLatestServiceOrderStatusQuery.ts';
import { EulaInfo } from '../common/EulaInfo';
import { IsvNameDisplay } from '../common/IsvNameDisplay.tsx';
import { ServiceTitle } from '../common/ServiceTitle.tsx';
import { OrderItem } from '../common/utils/OrderItem';
import { OrderSubmitProps } from '../common/utils/OrderSubmitProps';
import OrderSubmitStatusAlert from '../orderStatus/OrderSubmitStatusAlert';
import userOrderableServicesQuery from '../query/userOrderableServicesQuery.ts';
import useRedeployFailedDeploymentQuery from '../retryDeployment/useRedeployFailedDeploymentQuery';
import { useOrderFormStore } from '../store/OrderFormStore';
import NavigateOrderSubmission from './NavigateOrderSubmission';
import { useDeployRequestSubmitQuery } from './useDeployRequestSubmitQuery';

function OrderSubmit(state: OrderSubmitProps): React.JSX.Element {
    const [form] = Form.useForm();
    const [isEulaAccepted, setIsEulaAccepted] = useState<boolean>(false);
    const [isShowDeploymentResult, setIsShowDeploymentResult] = useState<boolean>(false);
    const uniqueRequestId = useRef(v4());
    const submitDeploymentRequest = useDeployRequestSubmitQuery();
    const redeployFailedDeploymentQuery = useRedeployFailedDeploymentQuery(state.serviceHostingType);
    const getSubmitLatestServiceOrderStatusQuery = useLatestServiceOrderStatusQuery(
        redeployFailedDeploymentQuery.isSuccess
            ? redeployFailedDeploymentQuery.data.orderId
            : (submitDeploymentRequest.data?.orderId ?? ''),
        submitDeploymentRequest.isSuccess || redeployFailedDeploymentQuery.isSuccess,
        [taskStatus.SUCCESSFUL, taskStatus.FAILED]
    );

    const orderableServicesQuery = userOrderableServicesQuery(state.category, state.name);

    const [cacheFormVariable] = useOrderFormStore((state) => [state.addDeployVariable]);

    const navigate = useNavigate();

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (state === undefined || state === null) {
        void navigate(homePageRoute);
    }

    function onSubmit() {
        setIsShowDeploymentResult(true);
        uniqueRequestId.current = v4();
        const createRequest: DeployRequest = {
            category: state.category,
            csp: state.csp,
            flavor: state.flavor,
            region: state.region,
            serviceName: state.name,
            version: state.version,
            customerServiceName: useOrderFormStore.getState().deployParams.Name as string,
            serviceHostingType: state.serviceHostingType,
            availabilityZones: state.availabilityZones,
            eulaAccepted: isEulaAccepted,
            billingMode: state.billingMode,
        };
        const serviceRequestProperties: Record<string, unknown> = {};
        for (const variable in useOrderFormStore.getState().deployParams) {
            if (
                variable !== CUSTOMER_SERVICE_NAME_FIELD &&
                useOrderFormStore.getState().deployParams[variable] !== ''
            ) {
                serviceRequestProperties[variable] = useOrderFormStore.getState().deployParams[variable];
            }
        }
        createRequest.serviceRequestProperties = serviceRequestProperties as Record<string, never>;
        submitDeploymentRequest.mutate(createRequest);
    }

    const retryRequest = () => {
        uniqueRequestId.current = v4();
        if (submitDeploymentRequest.isSuccess) {
            redeployFailedDeploymentQuery.mutate(submitDeploymentRequest.data.serviceId);
        } else {
            if (
                isHandleKnownErrorResponse(submitDeploymentRequest.error) &&
                'serviceId' in submitDeploymentRequest.error.body
            ) {
                redeployFailedDeploymentQuery.mutate(submitDeploymentRequest.error.body.serviceId as string);
            }
        }
    };

    const onClose = () => {
        void navigate(servicesSubPageRoute.concat(state.category));
    };

    const createServicePageUrl: string = createServicePageRoute
        .concat('?catalog=', state.category)
        .concat('&serviceName=', state.name)
        .concat('&latestVersion=', state.version)
        .concat('&billingMode=', state.billingMode);

    const isBackDisabled = () => {
        if (submitDeploymentRequest.isPending || redeployFailedDeploymentQuery.isPending) {
            return true;
        }
        if (
            submitDeploymentRequest.isError ||
            redeployFailedDeploymentQuery.isError ||
            getSubmitLatestServiceOrderStatusQuery.isError
        ) {
            return true;
        }
        if (
            submitDeploymentRequest.isSuccess &&
            (getSubmitLatestServiceOrderStatusQuery.isPending ||
                getSubmitLatestServiceOrderStatusQuery.data.taskStatus.toString() ===
                    taskStatus.IN_PROGRESS.toString() ||
                getSubmitLatestServiceOrderStatusQuery.data.taskStatus.toString() === taskStatus.SUCCESSFUL.toString())
        ) {
            return true;
        }
        return false;
    };

    const isDeployDisabled = () => {
        if (submitDeploymentRequest.isPending || redeployFailedDeploymentQuery.isPending) {
            return true;
        }
        if (
            submitDeploymentRequest.isError ||
            redeployFailedDeploymentQuery.isError ||
            getSubmitLatestServiceOrderStatusQuery.isError
        ) {
            return true;
        }

        if (
            submitDeploymentRequest.isSuccess &&
            (getSubmitLatestServiceOrderStatusQuery.isPending ||
                getSubmitLatestServiceOrderStatusQuery.data.taskStatus.toString() ===
                    taskStatus.IN_PROGRESS.toString() ||
                getSubmitLatestServiceOrderStatusQuery.data.taskStatus.toString() ===
                    taskStatus.SUCCESSFUL.toString() ||
                getSubmitLatestServiceOrderStatusQuery.data.taskStatus.toString() === taskStatus.FAILED.toString())
        ) {
            return true;
        }
        return false;
    };

    const isDeployLoading = () => {
        if (submitDeploymentRequest.isPending || redeployFailedDeploymentQuery.isPending) {
            return true;
        }
        if (
            submitDeploymentRequest.isError ||
            redeployFailedDeploymentQuery.isError ||
            getSubmitLatestServiceOrderStatusQuery.isError
        ) {
            return false;
        }
        if (
            submitDeploymentRequest.isSuccess &&
            (getSubmitLatestServiceOrderStatusQuery.isPending ||
                getSubmitLatestServiceOrderStatusQuery.data.taskStatus.toString() === taskStatus.IN_PROGRESS.toString())
        ) {
            return true;
        }
        return false;
    };

    return (
        <>
            <div>
                <div className={tableStyles.genericTableContainer}>
                    <Row justify='space-between'>
                        <Col span={6}>
                            <ServiceTitle
                                title={state.name}
                                version={state.version}
                                icon={orderableServicesQuery.isSuccess ? orderableServicesQuery.data[0].icon : ''}
                            />
                        </Col>
                        <Col span={8}>
                            <div className={serviceOrderStyles.serviceVendorContactClass}>
                                <div className={serviceOrderStyles.serviceOrderSubmitApiDocClass}>
                                    <ApiDoc
                                        serviceTemplateId={state.id}
                                        styleClass={serviceOrderStyles.contentTitleApi}
                                    ></ApiDoc>
                                </div>
                                <div className={serviceOrderStyles.serviceOrderSubmitOptionVendor}>
                                    <IsvNameDisplay serviceVendor={state.serviceVendor} />
                                </div>
                                {state.contactServiceDetails ? (
                                    <div className={serviceOrderStyles.serviceApiDocVendorClass}>
                                        <ContactDetailsText
                                            serviceProviderContactDetails={state.contactServiceDetails}
                                            showFor={ContactDetailsShowType.Order}
                                        />
                                    </div>
                                ) : null}
                            </div>
                        </Col>
                    </Row>
                    {isShowDeploymentResult ? (
                        <OrderSubmitStatusAlert
                            key={uniqueRequestId.current}
                            serviceId={submitDeploymentRequest.data?.serviceId ?? ''}
                            serviceHostType={state.serviceHostingType}
                            submitDeploymentRequest={submitDeploymentRequest}
                            redeployFailedDeploymentQuery={redeployFailedDeploymentQuery}
                            getSubmitLatestServiceOrderStatusQuery={getSubmitLatestServiceOrderStatusQuery}
                            serviceProviderContactDetails={state.contactServiceDetails}
                            retryRequest={retryRequest}
                            onClose={onClose}
                        />
                    ) : null}
                    <Form
                        form={form}
                        layout='vertical'
                        autoComplete='off'
                        initialValues={useOrderFormStore.getState().deployParams}
                        onFinish={onSubmit}
                        validateTrigger={['onSubmit', 'onBlur', 'onChange']}
                        key='deploy'
                        disabled={submitDeploymentRequest.isSuccess}
                    >
                        <div className={serviceOrderStyles.orderFormGroupItems}>
                            <div className={serviceOrderStyles.orderParamItemLeft} />
                            <Form.Item
                                name={'Name'}
                                label={'Name: Service Name'}
                                rules={[{ required: true }, { type: 'string', min: 5 }]}
                                colon={true}
                                className={serviceOrderStyles.orderParamsFirstParam}
                            >
                                <Input
                                    name={'Name'}
                                    showCount
                                    placeholder={'customer defined name for service ordered'}
                                    maxLength={256}
                                    onChange={(e) => {
                                        cacheFormVariable(CUSTOMER_SERVICE_NAME_FIELD, e.target.value);
                                    }}
                                    className={serviceOrderStyles.orderParamItemContent}
                                    suffix={
                                        <Tooltip title={'Customer defined name for the service instance created'}>
                                            <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                                        </Tooltip>
                                    }
                                />
                            </Form.Item>
                            <div
                                className={
                                    getSubmitLatestServiceOrderStatusQuery.data?.taskStatus.toString() ===
                                    taskStatus.IN_PROGRESS.toString()
                                        ? `${serviceOrderStyles.deploying} ${serviceOrderStyles.orderParamItemRow}`
                                        : ''
                                }
                            >
                                {state.params.map((item) =>
                                    item.kind === 'variable' || item.kind === 'env' ? (
                                        <OrderItem key={item.name} item={item} csp={state.csp} region={state.region} />
                                    ) : undefined
                                )}
                            </div>
                        </div>
                        <div className={serviceOrderStyles.orderParamsFirstParam} />
                        <div className={serviceOrderStyles.orderParamItemRow}>
                            <div className={serviceOrderStyles.orderParamItemLeft} />
                            <div className={serviceOrderStyles.orderParamItemContent}>
                                <EulaInfo
                                    eula={state.eula}
                                    isEulaAccepted={isEulaAccepted}
                                    setIsEulaAccepted={setIsEulaAccepted}
                                />
                            </div>
                        </div>
                        <Row justify='space-around'>
                            <Col span={6}>
                                <div>
                                    <NavigateOrderSubmission
                                        text={'Back'}
                                        to={createServicePageUrl as To}
                                        props={state}
                                        disabled={isBackDisabled()}
                                    />
                                </div>
                            </Col>
                            <Col span={4}>
                                <div className={serviceOrderStyles.orderParamDeploy}>
                                    <Button
                                        type='primary'
                                        loading={isDeployLoading()}
                                        htmlType='submit'
                                        disabled={isDeployDisabled()}
                                    >
                                        Deploy
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </Form>
                </div>
            </div>
        </>
    );
}

function OrderSubmitPage(): React.JSX.Element {
    const location = useLocation();
    if (!location.state) {
        return <Navigate to={homePageRoute} />;
    }
    return OrderSubmit(location.state as OrderSubmitProps);
}

export default OrderSubmitPage;
