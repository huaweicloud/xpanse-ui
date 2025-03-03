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

function StartServiceStatusAlert({
    deployedService,
    serviceStateStartQuery,
    closeStartResultAlert,
    getStartServiceDetailsQuery,
    serviceProviderContactDetails,
}: {
    deployedService: DeployedService;
    serviceStateStartQuery: UseMutationResult<ServiceOrder, Error, string>;
    closeStartResultAlert: (arg: boolean) => void;
    getStartServiceDetailsQuery: UseQueryResult<ServiceOrderStatusUpdate>;
    serviceProviderContactDetails: ServiceProviderContactDetails | undefined;
}): React.JSX.Element {
    const onClose = () => {
        closeStartResultAlert(true);
    };

    const msg = useMemo(() => {
        if (serviceStateStartQuery.isPending) {
            return 'Request submission in-progress';
        } else if (serviceStateStartQuery.isError) {
            if (isHandleKnownErrorResponse(serviceStateStartQuery.error)) {
                const response: ErrorResponse = serviceStateStartQuery.error.body;
                return getOrderSubmissionFailedDisplay(response.errorType, response.details);
            } else {
                return getOrderSubmissionFailedDisplay(serviceStateStartQuery.error.name, [
                    serviceStateStartQuery.error.message,
                ]);
            }
        } else if (serviceStateStartQuery.isSuccess) {
            if (
                getStartServiceDetailsQuery.isSuccess &&
                (getStartServiceDetailsQuery.data.orderStatus.toString() === orderStatus.SUCCESSFUL.toString() ||
                    getStartServiceDetailsQuery.data.orderStatus.toString() === orderStatus.FAILED.toString())
            ) {
                return (
                    <OrderProcessingStatus
                        operationType={OperationType.Start}
                        serviceOrderStatus={getStartServiceDetailsQuery.data}
                        serviceId={deployedService.serviceId}
                        selectedServiceHostingType={deployedService.serviceHostingType as serviceHostingType}
                    />
                );
            } else if (getStartServiceDetailsQuery.isError) {
                if (deployedService.serviceHostingType === serviceHostingType.SERVICE_VENDOR) {
                    return 'Service start status polling failed. Please visit MyServices page to check the status of the request and contact service vendor for error details.';
                } else {
                    return 'Service start status polling failed. Please visit MyServices page to check the status of the request';
                }
            } else if (
                getStartServiceDetailsQuery.isPending ||
                getStartServiceDetailsQuery.data.orderStatus.toString() === orderStatus.IN_PROGRESS.toString()
            ) {
                return 'Starting, Please wait...';
            }
        }
    }, [
        serviceStateStartQuery.isPending,
        serviceStateStartQuery.isError,
        serviceStateStartQuery.isSuccess,
        serviceStateStartQuery.error,
        getStartServiceDetailsQuery.isSuccess,
        getStartServiceDetailsQuery.isError,
        getStartServiceDetailsQuery.isPending,
        getStartServiceDetailsQuery.data,
        deployedService.serviceId,
        deployedService.serviceHostingType,
    ]);

    const alertType = useMemo(() => {
        if (serviceStateStartQuery.isPending) {
            return 'success';
        } else if (serviceStateStartQuery.isError || getStartServiceDetailsQuery.isError) {
            return 'error';
        } else if (serviceStateStartQuery.isSuccess) {
            if (
                getStartServiceDetailsQuery.isSuccess &&
                getStartServiceDetailsQuery.data.orderStatus.toString() === orderStatus.FAILED.toString()
            ) {
                return 'error';
            } else if (
                getStartServiceDetailsQuery.isSuccess &&
                getStartServiceDetailsQuery.data.orderStatus.toString() === orderStatus.SUCCESSFUL.toString()
            ) {
                return 'success';
            } else if (
                getStartServiceDetailsQuery.isPending ||
                getStartServiceDetailsQuery.data.orderStatus.toString() === orderStatus.IN_PROGRESS.toString()
            ) {
                return 'success';
            }
        }
        return 'success';
    }, [serviceStateStartQuery, getStartServiceDetailsQuery]);

    function getOrderSubmissionFailedDisplay(errorType: string, reasons: string[]) {
        return (
            <div>
                <span>{errorType.length > 0 ? errorType : 'Service start request failed.'}</span>
                <div>{convertStringArrayToUnorderedList(reasons)}</div>
            </div>
        );
    }

    const getOrderId = (): string => {
        if (serviceStateStartQuery.isSuccess) {
            return serviceStateStartQuery.data.orderId;
        } else {
            if (
                isHandleKnownErrorResponse(serviceStateStartQuery.error) &&
                'orderId' in serviceStateStartQuery.error.body
            ) {
                return serviceStateStartQuery.error.body.orderId as string;
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

export default StartServiceStatusAlert;
