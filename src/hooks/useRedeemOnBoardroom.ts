import {useCallback} from 'react';
import useBombFinance from './useBombFinance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useRedeemOnBoardroom = (description?: string) => {
  const bombFinance = useBombFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleRedeem = useCallback(() => {
    const alertDesc = description || 'Redeem _10SHARE from Boardroom';
    handleTransactionReceipt(bombFinance.exitFromBoardroom(), alertDesc);
  }, [bombFinance, description, handleTransactionReceipt]);
  return {onRedeem: handleRedeem};
};

export default useRedeemOnBoardroom;
