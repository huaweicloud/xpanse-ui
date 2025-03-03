/*
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: Huawei Inc.
 */

import { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import {
    DeployedService,
    ErrorResponse,
    errorType,
    ServiceOrder,
    ServiceProviderContactDetails,
    VendorHostedDeployedServiceDetails,
} from '../../../../xpanse-api/generated';
import { convertStringArrayToUnorderedList } from '../../../utils/generateUnorderedList.tsx';
import { isHandleKnownErrorResponse } from '../../common/error/isHandleKnownErrorResponse.ts';
import { PurgeOrderSubmitResult } from './PurgeOrderSubmitResult.tsx';

export function PurgeServiceStatusAlert({
    deployedService,
    purgeSubmitRequest,
    getPurgeServiceDetailsQuery,
    closePurgeResultAlert,
    serviceProviderContactDetails,
}: {
    deployedService: DeployedService;
    purgeSubmitRequest: UseMutationResult<ServiceOrder, Error, string>;
    getPurgeServiceDetailsQuery: UseQueryResult<VendorHostedDeployedServiceDetails>;
    closePurgeResultAlert: (arg: boolean) => void;
    serviceProviderContactDetails: ServiceProviderContactDetails | undefined;
}): React.JSX.Element {
    const onClose = () => {
        closePurgeResultAlert(true);
    };

    const msg = useMemo(() => {
        if (purgeSubmitRequest.isError) {
            if (isHandleKnownErrorResponse(purgeSubmitRequest.error)) {
                const response: ErrorResponse = purgeSubmitRequest.error.body;
                return getOrderSubmissionFailedDisplay(response.errorType, response.details);
            } else {
                return getOrderSubmissionFailedDisplay(purgeSubmitRequest.error.name, [
                    purgeSubmitRequest.error.message,
                ]);
            }
        }

        if (deployedService.serviceId && getPurgeServiceDetailsQuery.isError) {
            if (isHandleKnownErrorResponse(getPurgeServiceDetailsQuery.error)) {
                const response: ErrorResponse = getPurgeServiceDetailsQuery.error.body;
                if (response.errorType !== errorType.SERVICE_DEPLOYMENT_NOT_FOUND) {
                    return getOrderSubmissionFailedDisplay(response.errorType, response.details);
                } else {
                    return 'Service purged successfully';
                }
            }
        }
    }, [
        purgeSubmitRequest.isError,
        purgeSubmitRequest.error,
        getPurgeServiceDetailsQuery.isError,
        getPurgeServiceDetailsQuery.error,
        deployedService.serviceId,
    ]);

    const alertType = useMemo(() => {
        if (purgeSubmitRequest.isPending) {
            return 'success';
        } else if (purgeSubmitRequest.isError) {
            return 'error';
        } else if (purgeSubmitRequest.isSuccess) {
            if (isHandleKnownErrorResponse(getPurgeServiceDetailsQuery.error)) {
                const response: ErrorResponse = getPurgeServiceDetailsQuery.error.body;
                if (response.errorType !== errorType.SERVICE_DEPLOYMENT_NOT_FOUND) {
                    return 'error';
                } else {
                    return 'success';
                }
            }
        }
        return 'success';
    }, [purgeSubmitRequest, getPurgeServiceDetailsQuery]);

    function getOrderSubmissionFailedDisplay(errorType: string, reasons: string[]) {
        return (
            <div>
                <span>{errorType.length > 0 ? errorType : 'Service destroy request failed.'}</span>
                <div>{convertStringArrayToUnorderedList(reasons)}</div>
            </div>
        );
    }

    const getOrderId = (): string => {
        if (purgeSubmitRequest.isSuccess) {
            return purgeSubmitRequest.data.orderId;
        } else {
            if (isHandleKnownErrorResponse(purgeSubmitRequest.error) && 'orderId' in purgeSubmitRequest.error.body) {
                return purgeSubmitRequest.error.body.orderId as string;
            }
            return '-';
        }
    };

    return (
        <PurgeOrderSubmitResult
            msg={msg ?? ''}
            serviceId={deployedService.serviceId}
            orderId={getOrderId()}
            type={alertType}
            onClose={onClose}
            contactServiceDetails={alertType !== 'success' ? serviceProviderContactDetails : undefined}
        />
    );
}
