/*
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: Huawei Inc.
 */

import { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import {
    DeployedService,
    ErrorResponse,
    orderStatus,
    serviceHostingType,
    ServiceOrder,
    ServiceOrderStatusUpdate,
    ServiceProviderContactDetails,
} from '../../../../../xpanse-api/generated';
import { convertStringArrayToUnorderedList } from '../../../../utils/generateUnorderedList.tsx';
import { isHandleKnownErrorResponse } from '../../../common/error/isHandleKnownErrorResponse.ts';
import { ServiceStateSubmitResult } from '../../common/ServiceStateSubmitResult.tsx';
import { OrderProcessingStatus } from '../../orderStatus/OrderProcessingStatus.tsx';
import { OperationType } from '../../types/OperationType.ts';

function StopServiceStatusAlert({
    deployedService,
    serviceStateStopQuery,
    closeStopResultAlert,
    getStopServiceDetailsQuery,
    serviceProviderContactDetails,
}: {
    deployedService: DeployedService;
    serviceStateStopQuery: UseMutationResult<ServiceOrder, Error, string>;
    closeStopResultAlert: (arg: boolean) => void;
    getStopServiceDetailsQuery: UseQueryResult<ServiceOrderStatusUpdate>;
    serviceProviderContactDetails: ServiceProviderContactDetails | undefined;
}): React.JSX.Element {
    const onClose = () => {
        closeStopResultAlert(true);
    };

    const msg = useMemo(() => {
        if (serviceStateStopQuery.isPending) {
            return 'Request submission in-progress';
        } else if (serviceStateStopQuery.isError) {
            if (isHandleKnownErrorResponse(serviceStateStopQuery.error)) {
                const response: ErrorResponse = serviceStateStopQuery.error.body;
                return getOrderSubmissionFailedDisplay(response.errorType, response.details);
            } else {
                return getOrderSubmissionFailedDisplay(serviceStateStopQuery.error.name, [
                    serviceStateStopQuery.error.message,
                ]);
            }
        } else if (serviceStateStopQuery.isSuccess) {
            if (
                getStopServiceDetailsQuery.isSuccess &&
                (getStopServiceDetailsQuery.data.orderStatus.toString() === orderStatus.SUCCESSFUL.toString() ||
                    getStopServiceDetailsQuery.data.orderStatus.toString() === orderStatus.FAILED.toString())
            ) {
                return (
                    <OrderProcessingStatus
                        operationType={OperationType.Stop}
                        serviceOrderStatus={getStopServiceDetailsQuery.data}
                        serviceId={deployedService.serviceId}
                        selectedServiceHostingType={deployedService.serviceHostingType as serviceHostingType}
                    />
                );
            } else if (getStopServiceDetailsQuery.isError) {
                if (deployedService.serviceHostingType === serviceHostingType.SERVICE_VENDOR) {
                    return 'Service stop status polling failed. Please visit MyServices page to check the status of the request and contact service vendor for error details.';
                } else {
                    return 'Service stop status polling failed. Please visit MyServices page to check the status of the request';
                }
            } else if (
                getStopServiceDetailsQuery.isPending ||
                getStopServiceDetailsQuery.data.orderStatus.toString() === orderStatus.IN_PROGRESS.toString()
            ) {
                return 'Stopping, Please wait...';
            }
        }
    }, [
        serviceStateStopQuery.isPending,
        serviceStateStopQuery.isError,
        serviceStateStopQuery.isSuccess,
        serviceStateStopQuery.error,
        getStopServiceDetailsQuery.isSuccess,
        getStopServiceDetailsQuery.isError,
        getStopServiceDetailsQuery.isPending,
        getStopServiceDetailsQuery.data,
        deployedService.serviceId,
        deployedService.serviceHostingType,
    ]);

    const alertType = useMemo(() => {
        if (serviceStateStopQuery.isPending) {
            return 'success';
        } else if (serviceStateStopQuery.isError || getStopServiceDetailsQuery.isError) {
            return 'error';
        } else if (serviceStateStopQuery.isSuccess) {
            if (
                getStopServiceDetailsQuery.isSuccess &&
                getStopServiceDetailsQuery.data.orderStatus.toString() === orderStatus.FAILED.toString()
            ) {
                return 'error';
            } else if (
                getStopServiceDetailsQuery.isSuccess &&
                getStopServiceDetailsQuery.data.orderStatus.toString() === orderStatus.SUCCESSFUL.toString()
            ) {
                return 'success';
            } else if (
                getStopServiceDetailsQuery.isPending ||
                getStopServiceDetailsQuery.data.orderStatus.toString() === orderStatus.IN_PROGRESS.toString()
            ) {
                return 'success';
            }
        }
        return 'success';
    }, [serviceStateStopQuery, getStopServiceDetailsQuery]);

    function getOrderSubmissionFailedDisplay(errorType: string, reasons: string[]) {
        return (
            <div>
                <span>{errorType.length > 0 ? errorType : 'Service stop request failed.'}</span>
                <div>{convertStringArrayToUnorderedList(reasons)}</div>
            </div>
        );
    }

    const getOrderId = (): string => {
        if (serviceStateStopQuery.isSuccess) {
            return serviceStateStopQuery.data.orderId;
        } else {
            if (
                isHandleKnownErrorResponse(serviceStateStopQuery.error) &&
                'orderId' in serviceStateStopQuery.error.body
            ) {
                return serviceStateStopQuery.error.body.orderId as string;
            }
            return '-';
        }
    };

    return (
        <ServiceStateSubmitResult
            msg={msg ?? ''}
            serviceId={deployedService.serviceId}
            orderId={getOrderId()}
            type={alertType}
            onClose={onClose}
            contactServiceDetails={alertType !== 'success' ? serviceProviderContactDetails : undefined}
        />
    );
}

export default StopServiceStatusAlert;
