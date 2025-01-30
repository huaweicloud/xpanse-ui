/*
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: Huawei Inc.
 */

import {
    CaretDownOutlined,
    CloseCircleOutlined,
    CopyOutlined,
    DeleteOutlined,
    EditOutlined,
    FileTextOutlined,
    FundOutlined,
    HistoryOutlined,
    InfoCircleOutlined,
    LockOutlined,
    PlayCircleOutlined,
    PoweroffOutlined,
    RedoOutlined,
    RiseOutlined,
    SyncOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Image, MenuProps, Modal, Popconfirm, Row, Space, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ColumnFilterItem } from 'antd/es/table/interface';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { v4 } from 'uuid';
import myServicesStyles from '../../../../styles/my-services.module.css';
import tableStyles from '../../../../styles/table.module.css';
import {
    billingMode,
    csp,
    DeployedService,
    DeployedServiceDetails,
    name,
    Region,
    serviceDeploymentState,
    serviceHostingType,
    serviceState,
    taskStatus,
    VendorHostedDeployedServiceDetails,
} from '../../../../xpanse-api/generated';
import { sortVersionNum } from '../../../utils/Sort';
import { cspMap } from '../../common/csp/CspLogo';
import { useLatestServiceOrderStatusQuery } from '../../common/queries/useLatestServiceOrderStatusQuery.ts';
import { ServiceTitle } from '../../order/common/ServiceTitle.tsx';
import { getExistingServiceParameters } from '../../order/common/utils/existingServiceParameters';
import DestroyServiceStatusAlert from '../../order/destroy/DestroyServiceStatusAlert';
import { useDestroyRequestSubmitQuery } from '../../order/destroy/useDestroyRequestSubmitQuery';
import { Locks } from '../../order/locks/Locks';
import { Modify } from '../../order/modify/Modify';
import { PurgeServiceStatusAlert } from '../../order/purge/PurgeServiceStatusAlert.tsx';
import { usePurgeRequestStatusQuery } from '../../order/purge/usePurgeRequestStatusQuery.ts';
import { usePurgeRequestSubmitQuery } from '../../order/purge/usePurgeRequestSubmitQuery';
import RecreateServiceStatusAlert from '../../order/recreate/RecreateServiceStatusAlert.tsx';
import useRecreateRequest from '../../order/recreate/useRecreateRequest.ts';
import { RetryServiceSubmit } from '../../order/retryDeployment/RetryServiceSubmit.tsx';
import useRedeployFailedDeploymentQuery from '../../order/retryDeployment/useRedeployFailedDeploymentQuery';
import { Scale } from '../../order/scale/Scale';
import { CreateServiceActionForm } from '../../order/serviceActions/CreateServiceActionForm';
import { CurrentServiceConfiguration } from '../../order/serviceConfiguration/CurrentServiceConfiguration';
import { ServicePorting } from '../../order/servicePorting/ServicePorting.tsx';
import RestartServiceStatusAlert from '../../order/serviceState/restart/RestartServiceStatusAlert';
import { useServiceStateRestartQuery } from '../../order/serviceState/restart/useServiceStateRestartQuery';
import StartServiceStatusAlert from '../../order/serviceState/start/StartServiceStatusAlert';
import { useServiceStateStartQuery } from '../../order/serviceState/start/useServiceStateStartQuery';
import StopServiceStatusAlert from '../../order/serviceState/stop/StopServiceStatusAlert';
import { useServiceStateStopQuery } from '../../order/serviceState/stop/useServiceStateStopQuery';
import { useOrderFormStore } from '../../order/store/OrderFormStore';
import { DeployedBillingMode } from '../common/DeployedBillingMode.tsx';
import { DeployedRegion } from '../common/DeployedRegion.tsx';
import DeployedServicesError from '../common/DeployedServicesError';
import { DeployedServicesHostingType } from '../common/DeployedServicesHostingType';
import { DeployedServicesRunningStatus } from '../common/DeployedServicesRunningStatus';
import { DeployedServicesStatus } from '../common/DeployedServicesStatus';
import { LocksTitle } from './LocksTitle.tsx';
import { MyServiceDetails } from './MyServiceDetails';
import { MyServiceHistory } from './MyServiceHistory';
import {
    getServiceDeploymentStateFromQuery,
    getServiceIdFormQuery,
    getServiceStateFromQuery,
    isDisableDestroyBtn,
    isDisableDetails,
    isDisabledStopOrRestartBtn,
    isDisableLocksBtn,
    isDisableModifyBtn,
    isDisableRecreateBtn,
    isDisableRetryDeploymentBtn,
    isDisableServiceConfigBtn,
    isDisableServicePortingBtn,
    isDisableStartBtn,
    updateBillingModeFilters,
    updateCategoryFilters,
    updateCspFilters,
    updateCustomerServiceNameFilters,
    updateNameFilters,
    updateRegionFilters,
    updateServiceDeploymentStateFilters,
    updateServiceHostingFilters,
    updateServiceIdFilters,
    updateServiceStateFilters,
    updateVersionFilters,
} from './myServiceProps.tsx';
import useGetOrderableServiceDetailsByServiceIdQuery from './query/useGetOrderableServiceDetailsByServiceIdQuery.ts';
import useListDeployedServicesDetailsQuery from './query/useListDeployedServicesDetailsQuery';
import { TooltipWhenDetailsDisabled } from './TooltipWhenDetailsDisabled.tsx';

function MyServices(): React.JSX.Element {
    const navigate = useNavigate();
    const [urlParams] = useSearchParams();
    const serviceIdInQuery = getServiceIdFormQuery(urlParams);
    const serviceDeploymentStateInQuery = getServiceDeploymentStateFromQuery(urlParams);
    const serviceStateInQuery = getServiceStateFromQuery(urlParams);

    const [cacheFormVariable] = useOrderFormStore((state) => [state.addDeployVariable]);
    const [clearFormVariables] = useOrderFormStore((state) => [state.clearFormVariables]);

    let serviceVoList: DeployedService[] = [];
    let versionFilters: ColumnFilterItem[] = [];
    let serviceHostingTypeFilters: ColumnFilterItem[] = [];
    let serviceBillingModeFilters: ColumnFilterItem[] = [];
    let serviceRegionNameFilters: ColumnFilterItem[] = [];
    let nameFilters: ColumnFilterItem[] = [];
    let customerServiceNameFilters: ColumnFilterItem[] = [];
    let categoryFilters: ColumnFilterItem[] = [];
    let cspFilters: ColumnFilterItem[] = [];
    let serviceIdFilters: ColumnFilterItem[] = [];
    let serviceDeploymentStateFilters: ColumnFilterItem[] = [];
    let serviceStateFilters: ColumnFilterItem[] = [];

    const [activeRecord, setActiveRecord] = useState<
        DeployedServiceDetails | VendorHostedDeployedServiceDetails | undefined
    >(undefined);

    const [isStartRequestSubmitted, setIsStartRequestSubmitted] = useState<boolean>(false);
    const [isStopRequestSubmitted, setIsStopRequestSubmitted] = useState<boolean>(false);
    const [isRestartRequestSubmitted, setIsRestartRequestSubmitted] = useState<boolean>(false);

    const [isDestroyRequestSubmitted, setIsDestroyRequestSubmitted] = useState<boolean>(false);
    const [isPurgeRequestSubmitted, setIsPurgeRequestSubmitted] = useState<boolean>(false);
    const [isRetryDeployRequestSubmitted, setIsRetryDeployRequestSubmitted] = useState<boolean>(false);
    const [isRecreateRequestSubmitted, setIsRecreateRequestSubmitted] = useState<boolean>(false);

    const [isMyServiceDetailsModalOpen, setIsMyServiceDetailsModalOpen] = useState(false);
    const [isMyServiceHistoryModalOpen, setIsMyServiceHistoryModalOpen] = useState(false);
    const [isMyServiceConfigurationModalOpen, setIsMyServiceConfigurationModalOpen] = useState(false);
    const [isServiceActionsModalOpen, setIsServiceActionsModalOpen] = useState(false);

    const [isServicePortingModalOpen, setIsServicePortingModalOpen] = useState<boolean>(false);
    const [isModifyModalOpen, setIsModifyModalOpen] = useState<boolean>(false);
    const [isScaleModalOpen, setIsScaleModalOpen] = useState<boolean>(false);
    const [isLocksModalOpen, setIsLocksModalOpen] = useState<boolean>(false);

    const [uniqueRequestId, setUniqueRequestId] = useState<string>(v4());

    const serviceDestroyQuery = useDestroyRequestSubmitQuery();
    const servicePurgeQuery = usePurgeRequestSubmitQuery();
    const redeployFailedDeploymentQuery = useRedeployFailedDeploymentQuery(
        activeRecord ? (activeRecord.serviceHostingType as serviceHostingType) : serviceHostingType.SELF
    );
    const serviceRecreateRequest = useRecreateRequest();

    const serviceStateStartQuery = useServiceStateStartQuery();
    const serviceStateStopQuery = useServiceStateStopQuery();
    const serviceStateRestartQuery = useServiceStateRestartQuery();

    const listDeployedServicesQuery = useListDeployedServicesDetailsQuery();
    const getOrderableServiceDetails = useGetOrderableServiceDetailsByServiceIdQuery(activeRecord?.serviceId);

    const getStartServiceDetailsQuery = useLatestServiceOrderStatusQuery(
        serviceStateStartQuery.data?.orderId ?? '',
        serviceStateStartQuery.isSuccess,
        [taskStatus.SUCCESSFUL, taskStatus.FAILED]
    );

    const getStopServiceDetailsQuery = useLatestServiceOrderStatusQuery(
        serviceStateStopQuery.data?.orderId ?? '',
        serviceStateStopQuery.isSuccess,
        [taskStatus.SUCCESSFUL, taskStatus.FAILED]
    );

    const getRestartServiceDetailsQuery = useLatestServiceOrderStatusQuery(
        serviceStateRestartQuery.data?.orderId ?? '',
        serviceStateRestartQuery.isSuccess,
        [taskStatus.SUCCESSFUL, taskStatus.FAILED]
    );

    const getDestroyServiceStatusPollingQuery = useLatestServiceOrderStatusQuery(
        serviceDestroyQuery.data?.orderId ?? '',
        serviceDestroyQuery.isSuccess,
        [taskStatus.SUCCESSFUL, taskStatus.FAILED]
    );

    const getReDeployLatestServiceOrderStatusQuery = useLatestServiceOrderStatusQuery(
        redeployFailedDeploymentQuery.data?.orderId ?? '',
        redeployFailedDeploymentQuery.isSuccess,
        [taskStatus.SUCCESSFUL, taskStatus.FAILED]
    );

    const getRecreateServiceOrderStatusPollingQuery = useLatestServiceOrderStatusQuery(
        serviceRecreateRequest.data?.orderId,
        serviceRecreateRequest.isSuccess,
        [taskStatus.SUCCESSFUL, taskStatus.FAILED]
    );

    const getPurgeServiceDetailsQuery = usePurgeRequestStatusQuery(
        activeRecord?.serviceId,
        activeRecord ? (activeRecord.serviceHostingType as serviceHostingType) : serviceHostingType.SELF,
        servicePurgeQuery.isSuccess,
        isPurgeRequestSubmitted
    );

    useEffect(() => {
        void listDeployedServicesQuery.refetch();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        servicePurgeQuery.isError,
        getPurgeServiceDetailsQuery.isError,
        serviceDestroyQuery.isError,
        getDestroyServiceStatusPollingQuery.data?.isOrderCompleted,
        serviceRecreateRequest.isError,
        getRecreateServiceOrderStatusPollingQuery.isError,
        getRecreateServiceOrderStatusPollingQuery.data?.isOrderCompleted,
        serviceStateStartQuery.isError,
        getStartServiceDetailsQuery.isError,
        getStartServiceDetailsQuery.data?.isOrderCompleted,
        serviceStateStopQuery.isError,
        getStopServiceDetailsQuery.isError,
        getStopServiceDetailsQuery.data?.isOrderCompleted,
        serviceStateRestartQuery.isError,
        getRestartServiceDetailsQuery.isError,
        getRestartServiceDetailsQuery.data?.isOrderCompleted,
        redeployFailedDeploymentQuery.isError,
        getReDeployLatestServiceOrderStatusQuery.isError,
        getReDeployLatestServiceOrderStatusQuery.data?.isOrderCompleted,
    ]);

    if (listDeployedServicesQuery.isSuccess && listDeployedServicesQuery.data.length > 0) {
        if (serviceDeploymentStateInQuery && serviceDeploymentStateInQuery.length > 0) {
            serviceVoList = listDeployedServicesQuery.data.filter((serviceVo: DeployedService) =>
                serviceDeploymentStateInQuery.includes(serviceVo.serviceDeploymentState as serviceDeploymentState)
            );
        } else if (serviceStateInQuery && serviceStateInQuery.length > 0) {
            serviceVoList = listDeployedServicesQuery.data.filter((serviceVo: DeployedService) =>
                serviceStateInQuery.includes(serviceVo.serviceState as serviceState)
            );
        } else if (serviceIdInQuery && serviceIdInQuery.length > 0) {
            serviceVoList = listDeployedServicesQuery.data.filter(
                (serviceVo: { serviceId: string }) => serviceVo.serviceId === serviceIdInQuery
            );
        } else {
            serviceVoList = listDeployedServicesQuery.data;
        }
        serviceIdFilters = updateServiceIdFilters(listDeployedServicesQuery.data);
        versionFilters = updateVersionFilters(listDeployedServicesQuery.data);
        nameFilters = updateNameFilters(listDeployedServicesQuery.data);
        categoryFilters = updateCategoryFilters();
        cspFilters = updateCspFilters();
        serviceDeploymentStateFilters = updateServiceDeploymentStateFilters();
        serviceStateFilters = updateServiceStateFilters();
        customerServiceNameFilters = updateCustomerServiceNameFilters(listDeployedServicesQuery.data);
        serviceHostingTypeFilters = updateServiceHostingFilters();
        serviceBillingModeFilters = updateBillingModeFilters();
        serviceRegionNameFilters = updateRegionFilters(listDeployedServicesQuery.data);
    }

    const getOperationMenu = (record: DeployedService): MenuProps['items'] => {
        return [
            {
                key: 'details',
                label: isDisableDetails(record) ? (
                    <Tooltip
                        placement={'left'}
                        style={{ maxWidth: '100%' }}
                        title={
                            getOrderableServiceDetails.isSuccess ? (
                                <TooltipWhenDetailsDisabled
                                    serviceProviderContactDetails={
                                        getOrderableServiceDetails.data.serviceProviderContactDetails
                                    }
                                />
                            ) : (
                                <></>
                            )
                        }
                    >
                        <Button
                            disabled={true}
                            className={myServicesStyles.buttonAsLink}
                            icon={<InfoCircleOutlined />}
                            type={'link'}
                        >
                            details
                        </Button>
                    </Tooltip>
                ) : (
                    <Button
                        onClick={() => {
                            handleMyServiceDetailsOpenModal(record);
                        }}
                        className={myServicesStyles.buttonAsLink}
                        icon={<InfoCircleOutlined />}
                        type={'link'}
                    >
                        details
                    </Button>
                ),
            },
            {
                key: 'locks',
                label: (
                    <Button
                        onClick={() => {
                            locks(record);
                        }}
                        className={myServicesStyles.buttonAsLink}
                        icon={<LockOutlined />}
                        disabled={isDisableLocksBtn(record, activeRecord)}
                        type={'link'}
                    >
                        locks
                    </Button>
                ),
            },
            {
                key: 'scale',
                label: (
                    <>
                        {record.lockConfig?.modifyLocked ? (
                            <Tooltip
                                placement={'left'}
                                style={{ maxWidth: '100%' }}
                                title={'scaling has been locked for this service.'}
                            >
                                <Button
                                    className={myServicesStyles.buttonAsLink}
                                    icon={<RiseOutlined />}
                                    disabled={true}
                                    type={'link'}
                                >
                                    modify parameters
                                </Button>
                                <LockOutlined />
                            </Tooltip>
                        ) : (
                            <Button
                                onClick={() => {
                                    scale(record);
                                }}
                                className={myServicesStyles.buttonAsLink}
                                icon={<RiseOutlined />}
                                disabled={isDisableLocksBtn(record, activeRecord)}
                                type={'link'}
                            >
                                scale
                            </Button>
                        )}
                    </>
                ),
            },
            {
                key: 'modify parameters',
                label: (
                    <>
                        {record.lockConfig?.modifyLocked ? (
                            <Tooltip
                                placement={'left'}
                                style={{ maxWidth: '100%' }}
                                title={'modifications has been locked for this service.'}
                            >
                                <Button
                                    className={myServicesStyles.buttonAsLink}
                                    icon={<EditOutlined />}
                                    disabled={true}
                                    type={'link'}
                                >
                                    modify parameters
                                </Button>
                                <LockOutlined />
                            </Tooltip>
                        ) : (
                            <Button
                                onClick={() => {
                                    modify(record);
                                }}
                                className={myServicesStyles.buttonAsLink}
                                icon={<EditOutlined />}
                                disabled={isDisableModifyBtn(record, activeRecord)}
                                type={'link'}
                            >
                                modify parameters
                            </Button>
                        )}
                    </>
                ),
            },
            {
                key: 'servicePorting',
                label: (
                    <>
                        {record.lockConfig?.modifyLocked ? (
                            <Tooltip
                                placement={'left'}
                                style={{ maxWidth: '100%' }}
                                title={'service porting has been locked for this service.'}
                            >
                                <Button
                                    className={myServicesStyles.buttonAsLink}
                                    icon={<CopyOutlined />}
                                    disabled={true}
                                    type={'link'}
                                >
                                    port service
                                </Button>
                                <LockOutlined />
                            </Tooltip>
                        ) : (
                            <Button
                                onClick={() => {
                                    servicePorting(record);
                                }}
                                className={myServicesStyles.buttonAsLink}
                                icon={<CopyOutlined />}
                                disabled={isDisableServicePortingBtn(record, activeRecord)}
                                type={'link'}
                            >
                                port service
                            </Button>
                        )}
                    </>
                ),
            },
            record.serviceDeploymentState.toString() === serviceDeploymentState.DEPLOYMENT_FAILED.toString()
                ? {
                      key: 'retryDeployment',
                      label: (
                          <Popconfirm
                              title='Retry Deployment the service'
                              description='Are you sure to retry the service deployment?'
                              cancelText='Yes'
                              okText='No'
                              onCancel={() => {
                                  retryDeployment(record);
                              }}
                          >
                              <Button
                                  className={myServicesStyles.buttonAsLink}
                                  icon={<PlayCircleOutlined />}
                                  disabled={isDisableRetryDeploymentBtn(record)}
                                  type={'link'}
                              >
                                  retry deployment
                              </Button>
                          </Popconfirm>
                      ),
                  }
                : null,
            {
                key: 'recreateService',
                label: (
                    <>
                        {record.lockConfig?.modifyLocked ? (
                            <Tooltip
                                placement={'left'}
                                style={{ maxWidth: '100%' }}
                                title={'recreate has been locked for this service.'}
                            >
                                <Button
                                    className={myServicesStyles.buttonAsLink}
                                    icon={<RedoOutlined />}
                                    disabled={true}
                                    type={'link'}
                                >
                                    recreate
                                </Button>
                                <LockOutlined />
                            </Tooltip>
                        ) : (
                            <Popconfirm
                                title='Recreate the service'
                                description='Are you sure to recreate the service?'
                                cancelText='Yes'
                                okText='No'
                                onCancel={() => {
                                    recreate(record);
                                }}
                            >
                                <Button
                                    className={myServicesStyles.buttonAsLink}
                                    icon={<RedoOutlined />}
                                    disabled={isDisableRecreateBtn(
                                        record,
                                        activeRecord,
                                        serviceStateStartQuery.isPending,
                                        serviceStateStopQuery.isPending,
                                        serviceStateRestartQuery.isPending
                                    )}
                                    type={'link'}
                                >
                                    recreate
                                </Button>
                            </Popconfirm>
                        )}
                    </>
                ),
            },
            {
                key:
                    record.serviceDeploymentState.toString() === serviceDeploymentState.DESTROY_SUCCESSFUL.toString() ||
                    record.serviceDeploymentState.toString() === serviceDeploymentState.DEPLOYMENT_FAILED.toString() ||
                    record.serviceDeploymentState.toString() === serviceDeploymentState.ROLLBACK_FAILED.toString()
                        ? 'purge'
                        : 'destroy',
                label:
                    record.serviceDeploymentState.toString() === serviceDeploymentState.DESTROY_SUCCESSFUL.toString() ||
                    record.serviceDeploymentState.toString() === serviceDeploymentState.DEPLOYMENT_FAILED.toString() ||
                    record.serviceDeploymentState.toString() === serviceDeploymentState.ROLLBACK_FAILED.toString() ? (
                        <>
                            {record.lockConfig?.destroyLocked ? (
                                <Tooltip
                                    placement={'left'}
                                    style={{ maxWidth: '100%' }}
                                    title={'purging has been locked for this service.'}
                                >
                                    <Button
                                        icon={<DeleteOutlined />}
                                        disabled={true}
                                        className={myServicesStyles.buttonAsLink}
                                        type={'link'}
                                    >
                                        purge
                                    </Button>
                                    <LockOutlined />
                                </Tooltip>
                            ) : (
                                <Popconfirm
                                    title='Purge the service'
                                    description='Are you sure to purge the service?'
                                    cancelText='Yes'
                                    okText='No'
                                    onCancel={() => {
                                        purge(record);
                                    }}
                                >
                                    <Button
                                        icon={<DeleteOutlined />}
                                        disabled={
                                            activeRecord !== undefined ||
                                            (record.lockConfig?.destroyLocked !== undefined &&
                                                record.lockConfig.destroyLocked)
                                        }
                                        className={myServicesStyles.buttonAsLink}
                                        type={'link'}
                                    >
                                        purge
                                    </Button>
                                </Popconfirm>
                            )}
                        </>
                    ) : (
                        <>
                            {record.lockConfig?.destroyLocked ? (
                                <Tooltip
                                    placement={'left'}
                                    style={{ maxWidth: '100%' }}
                                    title={'destroy has been locked for this service.'}
                                >
                                    <Button
                                        icon={<CloseCircleOutlined />}
                                        disabled={true}
                                        className={myServicesStyles.buttonAsLink}
                                        type={'link'}
                                    >
                                        purge
                                    </Button>
                                    <LockOutlined />
                                </Tooltip>
                            ) : (
                                <Popconfirm
                                    title='Destroy the service'
                                    description='Are you sure to destroy the service?'
                                    cancelText='Yes'
                                    okText='No'
                                    onCancel={() => {
                                        destroy(record);
                                    }}
                                >
                                    <Button
                                        icon={<CloseCircleOutlined />}
                                        disabled={isDisableDestroyBtn(record, activeRecord)}
                                        className={myServicesStyles.buttonAsLink}
                                        type={'link'}
                                    >
                                        destroy
                                    </Button>
                                </Popconfirm>
                            )}
                        </>
                    ),
            },
            {
                key: 'start',
                label: (
                    <Button
                        onClick={() => {
                            start(record);
                        }}
                        className={myServicesStyles.buttonAsLink}
                        icon={<PlayCircleOutlined />}
                        disabled={isDisableStartBtn(
                            record,
                            activeRecord,
                            serviceStateStartQuery.isPending,
                            serviceStateStopQuery.isPending,
                            serviceStateRestartQuery.isPending
                        )}
                        type={'link'}
                    >
                        start
                    </Button>
                ),
            },
            {
                key: 'stop',
                label: (
                    <>
                        {record.lockConfig?.modifyLocked ? (
                            <Tooltip
                                placement={'left'}
                                style={{ maxWidth: '100%' }}
                                title={'stop has been locked for this service.'}
                            >
                                <Button
                                    className={myServicesStyles.buttonAsLink}
                                    icon={<PoweroffOutlined />}
                                    disabled={true}
                                    type={'link'}
                                >
                                    stop
                                </Button>
                                <LockOutlined />
                            </Tooltip>
                        ) : (
                            <Popconfirm
                                title='Stop the service'
                                description='Are you sure to stop the service?'
                                cancelText='Yes'
                                okText='No'
                                onCancel={() => {
                                    stop(record);
                                }}
                            >
                                <Button
                                    className={myServicesStyles.buttonAsLink}
                                    icon={<PoweroffOutlined />}
                                    disabled={isDisabledStopOrRestartBtn(
                                        record,
                                        activeRecord,
                                        serviceStateStartQuery.isPending,
                                        serviceStateStopQuery.isPending,
                                        serviceStateRestartQuery.isPending
                                    )}
                                    type={'link'}
                                >
                                    stop
                                </Button>
                            </Popconfirm>
                        )}
                    </>
                ),
            },
            {
                key: 'restart',
                label: (
                    <>
                        {record.lockConfig?.modifyLocked ? (
                            <Tooltip
                                placement={'left'}
                                style={{ maxWidth: '100%' }}
                                title={'restart has been locked for this service.'}
                            >
                                <Button
                                    className={myServicesStyles.buttonAsLink}
                                    icon={<SyncOutlined />}
                                    disabled={true}
                                    type={'link'}
                                >
                                    restart
                                </Button>
                                <LockOutlined />
                            </Tooltip>
                        ) : (
                            <Popconfirm
                                title='Restart the service'
                                description='Are you sure to restart the service?'
                                cancelText='Yes'
                                okText='No'
                                onCancel={() => {
                                    restart(record);
                                }}
                            >
                                <Button
                                    className={myServicesStyles.buttonAsLink}
                                    icon={<SyncOutlined />}
                                    disabled={isDisabledStopOrRestartBtn(
                                        record,
                                        activeRecord,
                                        serviceStateStartQuery.isPending,
                                        serviceStateStopQuery.isPending,
                                        serviceStateRestartQuery.isPending
                                    )}
                                    type={'link'}
                                >
                                    restart
                                </Button>
                            </Popconfirm>
                        )}
                    </>
                ),
            },
            {
                key: 'history',
                label: (
                    <Button
                        onClick={() => {
                            handleMyServiceHistoryOpenModal(record);
                        }}
                        className={myServicesStyles.buttonAsLink}
                        icon={<HistoryOutlined />}
                        type={'link'}
                    >
                        order history
                    </Button>
                ),
            },
            {
                key: 'configuration',
                label: (
                    <Button
                        onClick={() => {
                            handleMyServiceConfigurationOpenModal(record);
                        }}
                        className={myServicesStyles.buttonAsLink}
                        disabled={isDisableServiceConfigBtn(record)}
                        icon={<FileTextOutlined />}
                        type={'link'}
                    >
                        configuration
                    </Button>
                ),
            },
            {
                key: 'actions',
                label: (
                    <Button
                        onClick={() => {
                            handleServiceActionsOpenModal(record);
                        }}
                        className={myServicesStyles.buttonAsLink}
                        icon={<FileTextOutlined />}
                        type={'link'}
                    >
                        actions
                    </Button>
                ),
            },
        ];
    };

    const columns: ColumnsType<DeployedService> = [
        {
            title: 'Id',
            dataIndex: 'serviceId',
            filters: serviceIdInQuery ? undefined : serviceIdFilters,
            filterMode: 'tree',
            filterSearch: true,
            onFilter: (value: React.Key | boolean, record) => record.serviceId.startsWith(value.toString()),
            filtered: !!serviceIdInQuery,
            align: 'center',
        },
        {
            title: 'Name',
            dataIndex: 'customerServiceName',
            filters: customerServiceNameFilters,
            filterMode: 'tree',
            filterSearch: true,
            onFilter: (value: React.Key | boolean, record) => {
                if (record.customerServiceName !== undefined) {
                    const customerServiceName = record.customerServiceName;
                    return customerServiceName.startsWith(value.toString());
                }
                return false;
            },
            align: 'center',
        },
        {
            title: 'Category',
            dataIndex: 'category',
            filters: categoryFilters,
            filterMode: 'tree',
            filterSearch: true,
            onFilter: (value: React.Key | boolean, record) => record.category.startsWith(value.toString()),
            align: 'center',
        },
        {
            title: 'Service',
            dataIndex: 'name',
            filters: nameFilters,
            filterMode: 'tree',
            filterSearch: true,
            onFilter: (value: React.Key | boolean, record) => record.name.startsWith(value.toString()),
            align: 'center',
        },
        {
            title: 'Version',
            dataIndex: 'version',
            filters: versionFilters,
            filterMode: 'tree',
            filterSearch: true,
            onFilter: (value: React.Key | boolean, record) => record.version.startsWith(value.toString()),
            sorter: (service1, service2) => sortVersionNum(service1.version, service2.version),
            align: 'center',
        },
        {
            title: 'ServiceHostedBy',
            dataIndex: 'serviceHostingType',
            filters: serviceHostingTypeFilters,
            filterMode: 'tree',
            filterSearch: true,
            onFilter: (value: React.Key | boolean, record) => record.serviceHostingType.startsWith(value.toString()),
            align: 'center',
            render: (serviceHostingType: serviceHostingType) => (
                <DeployedServicesHostingType currentServiceHostingType={serviceHostingType} />
            ),
        },
        {
            title: 'BillingMode',
            dataIndex: 'billingMode',
            filters: serviceBillingModeFilters,
            filterMode: 'tree',
            filterSearch: true,
            onFilter: (value: React.Key | boolean, record) => record.billingMode.startsWith(value.toString()),
            align: 'center',
            render: (billingMode: billingMode) => <DeployedBillingMode currentBillingMode={billingMode} />,
        },
        {
            title: 'Region',
            dataIndex: 'region',
            filters: serviceRegionNameFilters,
            filterMode: 'tree',
            filterSearch: true,
            onFilter: (value: React.Key | boolean, record) => record.region.name.startsWith(value.toString()),
            align: 'center',
            render: (region: Region) => <DeployedRegion currentRegion={region} />,
        },
        {
            title: 'Csp',
            dataIndex: 'csp',
            filters: cspFilters,
            filterMode: 'tree',
            filterSearch: true,
            onFilter: (value: React.Key | boolean, record) => record.csp.startsWith(value.toString()),
            render: (csp: csp, _) => {
                return (
                    <Space size='middle'>
                        <Image width={100} preview={false} src={cspMap.get(csp.valueOf() as name)?.logo} />
                    </Space>
                );
            },
            align: 'center',
        },
        {
            title: 'Flavor',
            dataIndex: 'flavor',
            align: 'center',
        },
        {
            title: 'Created On',
            dataIndex: 'createTime',
            defaultSortOrder: 'descend',
            sorter: (serviceVoA, serviceVoB) => {
                const dateA = new Date(serviceVoA.createTime);
                const dateB = new Date(serviceVoB.createTime);
                return dateA.getTime() - dateB.getTime();
            },
            align: 'center',
        },
        {
            title: 'ServiceDeploymentState',
            dataIndex: 'serviceDeploymentState',
            filters: serviceDeploymentStateInQuery ? undefined : serviceDeploymentStateFilters,
            filterMode: 'tree',
            filterSearch: true,
            onFilter: (value: React.Key | boolean, record) =>
                record.serviceDeploymentState.startsWith(value.toString()),
            render: (serviceState: serviceDeploymentState) => DeployedServicesStatus(serviceState),
            filtered: !!serviceDeploymentStateInQuery,
            align: 'center',
        },
        {
            title: 'ServiceState',
            dataIndex: 'serviceState',
            align: 'center',
            filters: serviceStateInQuery ? undefined : serviceStateFilters,
            filtered: !!serviceStateInQuery,
            filterMode: 'tree',
            filterSearch: true,
            onFilter: (value: React.Key | boolean, record) => record.serviceState.startsWith(value.toString()),
            render: (_text, record) => DeployedServicesRunningStatus(record),
        },
        {
            title: 'Monitor',
            dataIndex: 'monitor',
            align: 'center',
            render: (_, record) => {
                return (
                    <Tooltip title='Viewing Monitoring Indicators' placement='top'>
                        <Button
                            type='text'
                            onClick={() => {
                                onMonitor(record);
                            }}
                            disabled={
                                record.serviceDeploymentState.toString() !==
                                    serviceDeploymentState.DEPLOYMENT_SUCCESSFUL.toString() &&
                                record.serviceDeploymentState.toString() !==
                                    serviceDeploymentState.MODIFICATION_SUCCESSFUL.toString()
                            }
                        >
                            <FundOutlined />
                        </Button>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Operation',
            dataIndex: 'operation',
            render: (_text: string, record: DeployedService) => {
                return (
                    <>
                        <Space size='middle'>
                            <Dropdown menu={{ items: getOperationMenu(record) }}>
                                <Button
                                    onClick={(e) => {
                                        e.preventDefault();
                                    }}
                                    type={'link'}
                                >
                                    <Space>
                                        More
                                        <CaretDownOutlined />
                                    </Space>
                                </Button>
                            </Dropdown>
                        </Space>
                    </>
                );
            },
            align: 'center',
        },
    ];

    const closeDestroyResultAlert = (isClose: boolean) => {
        if (isClose) {
            setActiveRecord(undefined);
            setIsDestroyRequestSubmitted(false);
            serviceDestroyQuery.reset();
        }
    };

    const closeStartResultAlert = (isClose: boolean) => {
        if (isClose) {
            setActiveRecord(undefined);
            setIsStartRequestSubmitted(false);
            serviceStateStartQuery.reset();
        }
    };

    const closeStopResultAlert = (isClose: boolean) => {
        if (isClose) {
            setActiveRecord(undefined);
            setIsStopRequestSubmitted(false);
            serviceStateStopQuery.reset();
        }
    };

    const closeRestartResultAlert = (isClose: boolean) => {
        if (isClose) {
            setActiveRecord(undefined);
            setIsRestartRequestSubmitted(false);
            serviceStateRestartQuery.reset();
        }
    };

    const closePurgeResultAlert = (isClose: boolean) => {
        if (isClose) {
            setActiveRecord(undefined);
            setIsPurgeRequestSubmitted(false);
            servicePurgeQuery.reset();
        }
    };

    const closeRetryDeployResultAlert = () => {
        setActiveRecord(undefined);
        refreshData();
        setIsRetryDeployRequestSubmitted(false);
        setUniqueRequestId('');
        redeployFailedDeploymentQuery.reset();
    };

    const closeRecreateResultAlert = (isClose: boolean) => {
        if (isClose) {
            setActiveRecord(undefined);
            setIsRecreateRequestSubmitted(false);
            serviceRecreateRequest.reset();
        }
    };

    const purge = (record: DeployedService): void => {
        setIsPurgeRequestSubmitted(true);
        setActiveRecord(
            record.serviceHostingType === serviceHostingType.SELF
                ? (record as DeployedServiceDetails)
                : (record as VendorHostedDeployedServiceDetails)
        );
        servicePurgeQuery.mutate(record.serviceId);
        record.serviceDeploymentState = serviceDeploymentState.DESTROYING;
    };

    function destroy(record: DeployedService): void {
        setIsDestroyRequestSubmitted(true);
        setActiveRecord(
            record.serviceHostingType === serviceHostingType.SELF
                ? (record as DeployedServiceDetails)
                : (record as VendorHostedDeployedServiceDetails)
        );
        serviceDestroyQuery.mutate(record.serviceId);
        record.serviceDeploymentState = serviceDeploymentState.DESTROYING;
    }

    function start(record: DeployedService): void {
        // force close any old alerts if still open.
        setIsStopRequestSubmitted(false);
        setIsRestartRequestSubmitted(false);
        setIsStartRequestSubmitted(true);
        setActiveRecord(
            record.serviceHostingType === serviceHostingType.SELF
                ? (record as DeployedServiceDetails)
                : (record as VendorHostedDeployedServiceDetails)
        );
        serviceStateStartQuery.mutate(record.serviceId);
        record.serviceState = serviceState.STARTING;
    }

    function stop(record: DeployedService): void {
        // force close any old alerts if still open.
        setIsStartRequestSubmitted(false);
        setIsRestartRequestSubmitted(false);
        setIsStopRequestSubmitted(true);
        setActiveRecord(
            record.serviceHostingType === serviceHostingType.SELF
                ? (record as DeployedServiceDetails)
                : (record as VendorHostedDeployedServiceDetails)
        );
        serviceStateStopQuery.mutate(record.serviceId);
        record.serviceState = serviceState.STOPPING;
    }

    function restart(record: DeployedService): void {
        // force close any old alerts if still open.
        setIsStartRequestSubmitted(false);
        setIsStopRequestSubmitted(false);
        setIsRestartRequestSubmitted(true);
        setActiveRecord(
            record.serviceHostingType === serviceHostingType.SELF
                ? (record as DeployedServiceDetails)
                : (record as VendorHostedDeployedServiceDetails)
        );
        serviceStateRestartQuery.mutate(record.serviceId);
        record.serviceState = serviceState.RESTARTING;
    }

    function servicePorting(record: DeployedService): void {
        setActiveRecord(
            record.serviceHostingType === serviceHostingType.SELF
                ? (record as DeployedServiceDetails)
                : (record as VendorHostedDeployedServiceDetails)
        );
        setIsServicePortingModalOpen(true);
    }

    function modify(record: DeployedService): void {
        setActiveRecord(
            record.serviceHostingType === serviceHostingType.SELF
                ? (record as DeployedServiceDetails)
                : (record as VendorHostedDeployedServiceDetails)
        );
        const existingParameters = getExistingServiceParameters(record);
        for (const existingServiceParametersKey in existingParameters) {
            cacheFormVariable(existingServiceParametersKey, existingParameters[existingServiceParametersKey]);
        }
        setIsModifyModalOpen(true);
    }

    function scale(record: DeployedService): void {
        setActiveRecord(
            record.serviceHostingType === serviceHostingType.SELF
                ? (record as DeployedServiceDetails)
                : (record as VendorHostedDeployedServiceDetails)
        );
        const existingParameters = getExistingServiceParameters(record);
        for (const existingServiceParametersKey in existingParameters) {
            cacheFormVariable(existingServiceParametersKey, existingParameters[existingServiceParametersKey]);
        }
        setIsScaleModalOpen(true);
    }

    function locks(record: DeployedService): void {
        setActiveRecord(
            record.serviceHostingType === serviceHostingType.SELF
                ? (record as DeployedServiceDetails)
                : (record as VendorHostedDeployedServiceDetails)
        );
        const existingParameters = getExistingServiceParameters(record);
        for (const existingServiceParametersKey in existingParameters) {
            cacheFormVariable(existingServiceParametersKey, existingParameters[existingServiceParametersKey]);
        }
        setIsLocksModalOpen(true);
    }

    function retryDeployment(record: DeployedService): void {
        setIsRetryDeployRequestSubmitted(true);
        setActiveRecord(
            record.serviceHostingType === serviceHostingType.SELF
                ? (record as DeployedServiceDetails)
                : (record as VendorHostedDeployedServiceDetails)
        );
        redeployFailedDeploymentQuery.mutate(record.serviceId);
        record.serviceDeploymentState = serviceDeploymentState.DEPLOYING;
    }

    function recreate(record: DeployedService): void {
        setIsRecreateRequestSubmitted(true);
        setActiveRecord(
            record.serviceHostingType === serviceHostingType.SELF
                ? (record as DeployedServiceDetails)
                : (record as VendorHostedDeployedServiceDetails)
        );
        serviceRecreateRequest.mutate(record.serviceId);
        record.serviceDeploymentState = serviceDeploymentState.DESTROYING;
    }

    function onMonitor(record: DeployedService): void {
        void navigate('/monitor', {
            state: record,
        });
    }

    function refreshData(): void {
        clearFormVariables();
        setIsPurgeRequestSubmitted(false);
        void listDeployedServicesQuery.refetch();
    }

    const handleMyServiceDetailsOpenModal = (record: DeployedService) => {
        setActiveRecord(
            record.serviceHostingType === serviceHostingType.SELF
                ? (record as DeployedServiceDetails)
                : (record as VendorHostedDeployedServiceDetails)
        );
        setIsMyServiceDetailsModalOpen(true);
    };

    const handleMyServiceDetailsModalClose = () => {
        setActiveRecord(undefined);
        setIsMyServiceDetailsModalOpen(false);
    };

    const handleMyServiceHistoryOpenModal = (record: DeployedService) => {
        setActiveRecord(
            record.serviceHostingType === serviceHostingType.SELF
                ? (record as DeployedServiceDetails)
                : (record as VendorHostedDeployedServiceDetails)
        );
        setIsMyServiceHistoryModalOpen(true);
    };

    const handleMyServiceHistoryModalClose = () => {
        setActiveRecord(undefined);
        setIsMyServiceHistoryModalOpen(false);
    };

    const handleMyServiceConfigurationOpenModal = (record: DeployedService) => {
        setActiveRecord(
            record.serviceHostingType === serviceHostingType.SELF
                ? (record as DeployedServiceDetails)
                : (record as VendorHostedDeployedServiceDetails)
        );
        setIsMyServiceConfigurationModalOpen(true);
    };

    const handleMyServiceConfigurationModalClose = () => {
        setActiveRecord(undefined);
        setIsMyServiceConfigurationModalOpen(false);
    };

    const handleServiceActionsOpenModal = (record: DeployedService) => {
        setActiveRecord(
            record.serviceHostingType === serviceHostingType.SELF
                ? (record as DeployedServiceDetails)
                : (record as VendorHostedDeployedServiceDetails)
        );
        setIsServiceActionsModalOpen(true);
    };

    const handleServiceActionsModalClose = () => {
        setActiveRecord(undefined);
        setIsServiceActionsModalOpen(false);
    };

    const handleCancelServicePortingModel = () => {
        setActiveRecord(undefined);
        clearFormVariables();
        refreshData();
        setIsServicePortingModalOpen(false);
    };

    const handleCancelModifyModel = () => {
        setActiveRecord(undefined);
        clearFormVariables();
        refreshData();
        setIsModifyModalOpen(false);
    };

    const handleCancelScaleModel = () => {
        setActiveRecord(undefined);
        clearFormVariables();
        refreshData();
        setIsScaleModalOpen(false);
    };

    const handleCancelLocksModel = () => {
        setActiveRecord(undefined);
        clearFormVariables();
        refreshData();
        setIsLocksModalOpen(false);
    };

    const retryRequest = () => {
        setUniqueRequestId(v4());
        if (activeRecord && activeRecord.serviceId.length > 0) {
            redeployFailedDeploymentQuery.mutate(activeRecord.serviceId);
        }
    };

    return (
        <div className={tableStyles.genericTableContainer}>
            {isDestroyRequestSubmitted && activeRecord ? (
                <DestroyServiceStatusAlert
                    key={`${activeRecord.serviceId}-destroy`}
                    deployedService={activeRecord}
                    destroySubmitRequest={serviceDestroyQuery}
                    serviceStateDestroyQueryError={getDestroyServiceStatusPollingQuery.error}
                    serviceStateDestroyQueryData={getDestroyServiceStatusPollingQuery.data}
                    closeDestroyResultAlert={closeDestroyResultAlert}
                    serviceProviderContactDetails={getOrderableServiceDetails.data?.serviceProviderContactDetails}
                />
            ) : null}
            {isStartRequestSubmitted && activeRecord ? (
                <StartServiceStatusAlert
                    key={`${activeRecord.serviceId}-start`}
                    deployedService={activeRecord}
                    serviceStateStartQuery={serviceStateStartQuery}
                    closeStartResultAlert={closeStartResultAlert}
                    getStartServiceDetailsQuery={getStartServiceDetailsQuery}
                    serviceProviderContactDetails={getOrderableServiceDetails.data?.serviceProviderContactDetails}
                />
            ) : null}
            {isStopRequestSubmitted && activeRecord ? (
                <StopServiceStatusAlert
                    key={`${activeRecord.serviceId}-stop`}
                    deployedService={activeRecord}
                    serviceStateStopQuery={serviceStateStopQuery}
                    closeStopResultAlert={closeStopResultAlert}
                    getStopServiceDetailsQuery={getStopServiceDetailsQuery}
                    serviceProviderContactDetails={getOrderableServiceDetails.data?.serviceProviderContactDetails}
                />
            ) : null}
            {isRestartRequestSubmitted && activeRecord ? (
                <RestartServiceStatusAlert
                    key={`${activeRecord.serviceId}-restart`}
                    deployedService={activeRecord}
                    serviceStateRestartQuery={serviceStateRestartQuery}
                    closeRestartResultAlert={closeRestartResultAlert}
                    getRestartServiceDetailsQuery={getRestartServiceDetailsQuery}
                    serviceProviderContactDetails={getOrderableServiceDetails.data?.serviceProviderContactDetails}
                />
            ) : null}
            {isPurgeRequestSubmitted && activeRecord ? (
                <PurgeServiceStatusAlert
                    key={`${activeRecord.serviceId}-purge`}
                    deployedService={activeRecord}
                    purgeSubmitError={servicePurgeQuery.error}
                    statusPollingError={getPurgeServiceDetailsQuery.error}
                    closePurgeResultAlert={closePurgeResultAlert}
                    serviceProviderContactDetails={getOrderableServiceDetails.data?.serviceProviderContactDetails}
                />
            ) : null}
            {isRetryDeployRequestSubmitted && activeRecord ? (
                <RetryServiceSubmit
                    key={`${uniqueRequestId}-retry`}
                    currentSelectedService={activeRecord}
                    submitDeploymentRequest={redeployFailedDeploymentQuery}
                    redeployFailedDeploymentQuery={redeployFailedDeploymentQuery}
                    getSubmitLatestServiceOrderStatusQuery={getReDeployLatestServiceOrderStatusQuery}
                    serviceProviderContactDetails={getOrderableServiceDetails.data?.serviceProviderContactDetails}
                    retryRequest={retryRequest}
                    onClose={closeRetryDeployResultAlert}
                />
            ) : null}
            {isRecreateRequestSubmitted && activeRecord ? (
                <RecreateServiceStatusAlert
                    key={`${activeRecord.serviceId}-recreate`}
                    currentSelectedService={activeRecord}
                    recreateRequest={serviceRecreateRequest}
                    recreateServiceOrderStatusPollingQuery={getRecreateServiceOrderStatusPollingQuery}
                    closeRecreateResultAlert={closeRecreateResultAlert}
                    serviceProviderContactDetails={getOrderableServiceDetails.data?.serviceProviderContactDetails}
                />
            ) : null}
            {activeRecord ? (
                <Modal
                    title={'Service Details'}
                    width={1000}
                    footer={null}
                    open={isMyServiceDetailsModalOpen}
                    onCancel={handleMyServiceDetailsModalClose}
                >
                    <MyServiceDetails deployedService={activeRecord} />
                </Modal>
            ) : null}
            {activeRecord ? (
                <Modal
                    title={'Service Orders'}
                    width={1600}
                    footer={null}
                    open={isMyServiceHistoryModalOpen}
                    onCancel={handleMyServiceHistoryModalClose}
                >
                    <MyServiceHistory deployedService={activeRecord} />
                </Modal>
            ) : null}
            {activeRecord ? (
                <Modal
                    title={'Service Configuration'}
                    width={1600}
                    footer={null}
                    open={isMyServiceConfigurationModalOpen}
                    onCancel={handleMyServiceConfigurationModalClose}
                >
                    <CurrentServiceConfiguration
                        userOrderableServiceVo={getOrderableServiceDetails.data}
                        deployedService={activeRecord}
                    />
                </Modal>
            ) : null}
            {activeRecord ? (
                <Modal
                    title={'Service Actions'}
                    width={1600}
                    footer={null}
                    open={isServiceActionsModalOpen}
                    onCancel={handleServiceActionsModalClose}
                >
                    <CreateServiceActionForm
                        deployedService={activeRecord}
                        userOrderableServiceVo={getOrderableServiceDetails.data}
                    />
                </Modal>
            ) : null}
            {activeRecord ? (
                <Modal
                    key={`${activeRecord.serviceId}-servicePorting`}
                    open={isServicePortingModalOpen}
                    title={
                        <ServiceTitle
                            title={activeRecord.name}
                            version={activeRecord.version}
                            icon={getOrderableServiceDetails.data?.icon ?? ''}
                        />
                    }
                    closable={true}
                    maskClosable={false}
                    destroyOnClose={true}
                    footer={null}
                    onCancel={handleCancelServicePortingModel}
                    width={1600}
                    mask={true}
                >
                    <ServicePorting currentSelectedService={activeRecord} />
                </Modal>
            ) : null}

            {activeRecord ? (
                <Modal
                    open={isLocksModalOpen}
                    title={<LocksTitle />}
                    closable={true}
                    maskClosable={false}
                    destroyOnClose={true}
                    footer={null}
                    onCancel={handleCancelLocksModel}
                    width={400}
                    mask={true}
                >
                    <Locks currentSelectedService={activeRecord} />
                </Modal>
            ) : null}

            {activeRecord ? (
                <Modal
                    open={isScaleModalOpen}
                    title={
                        <ServiceTitle
                            title={activeRecord.name}
                            version={activeRecord.version}
                            icon={getOrderableServiceDetails.data?.icon ?? ''}
                        />
                    }
                    closable={true}
                    maskClosable={false}
                    destroyOnClose={true}
                    footer={null}
                    onCancel={handleCancelScaleModel}
                    width={1400}
                    mask={true}
                >
                    <Scale currentSelectedService={activeRecord} />
                </Modal>
            ) : null}

            {activeRecord ? (
                <Modal
                    open={isModifyModalOpen}
                    title={
                        <ServiceTitle
                            title={activeRecord.name}
                            version={activeRecord.version}
                            icon={getOrderableServiceDetails.data?.icon ?? ''}
                        />
                    }
                    closable={true}
                    maskClosable={false}
                    destroyOnClose={true}
                    footer={null}
                    onCancel={handleCancelModifyModel}
                    width={1400}
                    mask={true}
                >
                    <Modify currentSelectedService={activeRecord} />
                </Modal>
            ) : null}

            <div>
                <Button
                    disabled={activeRecord !== undefined}
                    type='primary'
                    icon={<SyncOutlined />}
                    onClick={() => {
                        refreshData();
                    }}
                >
                    refresh
                </Button>
            </div>
            {listDeployedServicesQuery.isError ? (
                <>
                    <DeployedServicesError error={listDeployedServicesQuery.error} />
                </>
            ) : (
                <></>
            )}

            <Row>
                <div className={myServicesStyles.serviceInstanceList}>
                    <Table
                        columns={columns}
                        dataSource={serviceVoList}
                        loading={listDeployedServicesQuery.isPending || listDeployedServicesQuery.isRefetching}
                        rowKey={'id'}
                    />
                </div>
            </Row>
        </div>
    );
}

export default MyServices;
