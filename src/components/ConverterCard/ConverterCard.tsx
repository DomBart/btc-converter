import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {decode} from 'html-entities';
import './style.scss';

const ConverterCard = () => {

    interface bitcoinObject {
        [name:string]: {
            code: string;
            description: string;
            rate: string;
            rate_float: number;
            symbol: string;
        }
    }

    interface amountObject {
        code: string;
        sum: string;
        symbol: string;
        active: boolean;
    }

    const [bitcoinAmount, setBitcoinAmount] = useState(0);
    const [bitcoinData, setBitcoinData] = useState<bitcoinObject>()
    const [amounts, setAmounts] = useState<Array<amountObject>>();

    const [inactiveEmpty, setInactiveEmpty] = useState(false);
    const [activeEmpty, setActiveEmpty] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try{
            const request = await axios.get('https://api.coindesk.com/v1/bpi/currentprice.json');
            setBitcoinData(request.data.bpi);
            }
            catch (error) {
                console.log(error);
            }
        }
        
        fetchData();
        const interval = setInterval(() => {
            fetchData();
        }, 60000 );
      
        return () => clearInterval(interval);
    }, [])

    useEffect(() => {
        const calculateRates = () => {
            if(bitcoinData){
                let array: Array<amountObject> = [];
                Object.keys(bitcoinData).forEach((key,i) => {
                    let bitNum = +(bitcoinData[key].rate.replace(',',''));
                    let bitStr =  new Intl.NumberFormat().format(bitcoinAmount*bitNum);
                    let state = false;
                    if(amounts){
                       state = amounts[i].active
                    }
                    array.push({code: bitcoinData[key].code, sum: bitStr, symbol: bitcoinData[key].symbol, active: state});
                  });
                  setAmounts(array);
            }
        }
        calculateRates();
    }, [bitcoinAmount, bitcoinData])

    const setActive = (id:string) => {
        let placeholder: Array<amountObject> = [];
        let empty = true;
        amounts?.forEach((amount) => {
            if(amount.code === id){
                amount.active = true;
            }
            if(!amount.active) {
                empty = false;
            }
            placeholder.push({code: amount.code, sum: amount.sum, symbol: amount.symbol, active: amount.active})
        })
        setActiveEmpty(false);
        setInactiveEmpty(empty);
        setAmounts(placeholder);
    }

    const setInactive = (id:string) => {
        let placeholder: Array<amountObject> = [];
        let empty = true;
        amounts?.forEach((amount) => {
            if(amount.code === id){
                amount.active = false;
            }
            if(amount.active) {
                empty = false;
            }
            placeholder.push({code: amount.code, sum: amount.sum, symbol: amount.symbol, active: amount.active})
        })
        setInactiveEmpty(false);
        setActiveEmpty(empty);
        setAmounts(placeholder);
    }

    return (
        <div className="card__container">
            <h1 className="card__title">Bitcoin keitykla</h1>
            <div className="card__top">
                <label >BTC
                <input defaultValue={0} onChange={event => setBitcoinAmount(+event.target.value)} type="number" />
                </label>
            </div>
            <div className="card__currencies">
                {
                    inactiveEmpty ? (
                        <p>All currencies selected</p>
                    ) : (
                        <select defaultValue="default" onChange={(e) => setActive(e.target.value)} className="card__select">
                        <option value="default" hidden>Add currency</option>
                        {
                        amounts?.map((amount,i) => (
                            (!amount.active) && (
                                <option key={i} value={amount.code} >{amount.code}</option>
                            )
                        ))}
                        </select> 
                    )
                }
                <div className="card__results">
                {
                    activeEmpty ? (
                        <p>Select a currency</p>
                    ) : (
                        <>
                            {amounts?.map((amount,i) => (
                                (amount.active) && (
                                    <label key={i} >{decode(amount.symbol)}
                                        <div className="card__calculated">
                                            <span>{amount.sum}</span>
                                            <span
                                            className="currency__remove"
                                            onClick={() => setInactive(amount.code)}
                                            >X
                                            </span>
                                        </div>
                                    </label>
                                ))
                            )}
                        </>
                    )
                }
                </div>
            </div>
        </div>
    )
}

export default ConverterCard
