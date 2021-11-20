import React, { /*useCallback, useEffect, */useMemo, useState } from 'react';
import Page from '../../components/Page';
import PitImage from '../../assets/img/pit.png';
import { createGlobalStyle } from 'styled-components';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { useWallet } from 'use-wallet';
import UnlockWallet from '../../components/UnlockWallet';
import PageHeader from '../../components/PageHeader';
import { Box,/* Paper, Typography,*/ Button, Grid } from '@material-ui/core';
import styled from 'styled-components';
import Spacer from '../../components/Spacer';
import useTombFinance from '../../hooks/useTombFinance';
import { getDisplayBalance/*, getBalance*/ } from '../../utils/formatBalance';
import { BigNumber/*, ethers*/ } from 'ethers';
import useSwapBBondToBShare from '../../hooks/TShareSwapper/useSwapTBondToTShare';
import useApprove, { ApprovalState } from '../../hooks/useApprove';
import useBShareSwapperStats from '../../hooks/TShareSwapper/useTShareSwapperStats';
import TokenInput from '../../components/TokenInput';
import Card from '../../components/Card';
import CardContent from '../../components/CardContent';
import TokenSymbol from '../../components/TokenSymbol';

const BackgroundImage = createGlobalStyle`
  body {
    background: url(${PitImage}) no-repeat !important;
    background-size: cover !important;
  }
`;

function isNumeric(n: any) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

const Sbs: React.FC = () => {
  const { path } = useRouteMatch();
  const { account } = useWallet();
  const bombFinance = useTombFinance();
  const [bbondAmount, setTbondAmount] = useState('');
  const [bshareAmount, setTshareAmount] = useState('');

  const [approveStatus, approve] = useApprove(bombFinance.BBOND, bombFinance.contracts.BShareSwapper.address);
  const { onSwapBShare } = useSwapBBondToBShare();
  const bshareSwapperStat = useBShareSwapperStats(account);

  const bshareBalance = useMemo(() => (bshareSwapperStat ? Number(bshareSwapperStat.bshareBalance) : 0), [bshareSwapperStat]);
  const bondBalance = useMemo(() => (bshareSwapperStat ? Number(bshareSwapperStat.bbondBalance) : 0), [bshareSwapperStat]);

  const handleBBondChange = async (e: any) => {
    if (e.currentTarget.value === '') {
      setTbondAmount('');
      setTshareAmount('');
      return
    }
    if (!isNumeric(e.currentTarget.value)) return;
    setTbondAmount(e.currentTarget.value);
    const updateBShareAmount = await bombFinance.estimateAmountOfBShare(e.currentTarget.value);
    setTshareAmount(updateBShareAmount);  
  };

  const handleBBondSelectMax = async () => {
    setTbondAmount(String(bondBalance));
    const updateBShareAmount = await bombFinance.estimateAmountOfBShare(String(bondBalance));
    setTshareAmount(updateBShareAmount); 
  };

  const handleBShareSelectMax = async () => {
    setTshareAmount(String(bshareBalance));
    const rateBSharePerTomb = (await bombFinance.getBShareSwapperStat(account)).rateBSharePerTomb;
    const updateBBondAmount = ((BigNumber.from(10).pow(30)).div(BigNumber.from(rateBSharePerTomb))).mul(Number(bshareBalance) * 1e6);
    setTbondAmount(getDisplayBalance(updateBBondAmount, 18, 6));
  };

  const handleBShareChange = async (e: any) => {
    const inputData = e.currentTarget.value;
    if (inputData === '') {
      setTshareAmount('');
      setTbondAmount('');
      return
    }
    if (!isNumeric(inputData)) return;
    setTshareAmount(inputData);
    const rateBSharePerTomb = (await bombFinance.getBShareSwapperStat(account)).rateBSharePerTomb;
    const updateBBondAmount = ((BigNumber.from(10).pow(30)).div(BigNumber.from(rateBSharePerTomb))).mul(Number(inputData) * 1e6);
    setTbondAmount(getDisplayBalance(updateBBondAmount, 18, 6));
  }

  return (
    <Switch>
      <Page>
        <BackgroundImage />
        {!!account ? (
          <>
            <Route exact path={path}>
              <PageHeader icon={'🏦'} title="BBond -> BShare Swap" subtitle="Swap BBond to BShare" />
            </Route>
            <Box mt={5}>
              <Grid container justify="center" spacing={6}>
                <StyledBoardroom>
                  <StyledCardsWrapper>
                    <StyledCardWrapper>
                      <Card>
                        <CardContent>
                          <StyledCardContentInner>
                            <StyledCardTitle>BBonds</StyledCardTitle>
                            <StyledExchanger>
                              <StyledToken>
                                <StyledCardIcon>
                                  <TokenSymbol symbol={bombFinance.BBOND.symbol} size={54} />
                                </StyledCardIcon>
                              </StyledToken>
                            </StyledExchanger>
                            <Grid item xs={12}>
                              <TokenInput
                                onSelectMax={handleBBondSelectMax}
                                onChange={handleBBondChange}
                                value={bbondAmount}
                                max={bondBalance}
                                symbol="BBond"
                              ></TokenInput>
                            </Grid>
                            <StyledDesc>{`${bondBalance} BBOND Available in Wallet`}</StyledDesc>
                          </StyledCardContentInner>
                        </CardContent>
                      </Card>
                    </StyledCardWrapper>
                    <Spacer size="lg"/>
                    <StyledCardWrapper>
                      <Card>
                        <CardContent>
                          <StyledCardContentInner>
                            <StyledCardTitle>BShare</StyledCardTitle>
                            <StyledExchanger>
                              <StyledToken>
                                <StyledCardIcon>
                                  <TokenSymbol symbol={bombFinance.BSHARE.symbol} size={54} />
                                </StyledCardIcon>
                              </StyledToken>
                            </StyledExchanger>
                            <Grid item xs={12}>
                              <TokenInput
                                onSelectMax={handleBShareSelectMax}
                                onChange={handleBShareChange}
                                value={bshareAmount}
                                max={bshareBalance}
                                symbol="BShare"
                              ></TokenInput>
                            </Grid>
                            <StyledDesc>{`${bshareBalance} BSHARE Available in Swapper`}</StyledDesc>
                          </StyledCardContentInner>
                        </CardContent>
                      </Card>
              
                    </StyledCardWrapper>
                  </StyledCardsWrapper>
                </StyledBoardroom>
              </Grid>
            </Box>

            <Box mt={5}>
              <Grid container justify="center">
                <Grid item xs={8}>
                  <Card>
                    <CardContent>
                      <StyledApproveWrapper>
                      {approveStatus !== ApprovalState.APPROVED ? (
                        <Button
                          disabled={approveStatus !== ApprovalState.NOT_APPROVED}
                          color="primary"
                          variant="contained"
                          onClick={approve}
                          size="medium"
                        >
                          Approve BBOND
                        </Button>
                      ) : (
                        <Button
                          color="primary"
                          variant="contained"
                          onClick={() => onSwapBShare(bbondAmount.toString())}
                          size="medium"
                        >
                          Swap
                        </Button>
                      )}
                      </StyledApproveWrapper>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </>
        ) : (
          <UnlockWallet />
        )}
      </Page>
    </Switch>
  );
};

const StyledBoardroom = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const StyledCardsWrapper = styled.div`
  display: flex;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: center;
  }
`;

const StyledCardWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const StyledApproveWrapper = styled.div`
  margin-left: auto;
  margin-right: auto;
`;
const StyledCardTitle = styled.div`
  align-items: center;
  display: flex;
  font-size: 20px;
  font-weight: 700;
  height: 64px;
  justify-content: center;
  margin-top: ${(props) => -props.theme.spacing[3]}px;
`;

const StyledCardIcon = styled.div`
  background-color: ${(props) => props.theme.color.grey[900]};
  width: 72px;
  height: 72px;
  border-radius: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${(props) => props.theme.spacing[2]}px;
`;

const StyledExchanger = styled.div`
  align-items: center;
  display: flex;
  margin-bottom: ${(props) => props.theme.spacing[5]}px;
`;

const StyledToken = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  font-weight: 600;
`;

const StyledCardContentInner = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
`;

const StyledDesc = styled.span``;

export default Sbs;
