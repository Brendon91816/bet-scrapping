// src/components/DataTable.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useTable } from 'react-table';
import './DataTable.css'; // Import your CSS file

const DataTable = () => {
    const [data, setData] = useState([]);

    const fetchData = useCallback(async () => {
        try {
            const response = await axios.get('https://api.arbitrage-bets.nl/get_data');
            const responseData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

            // Process the nested data structure
            let combinedData = [];
            for (const scraperKey in responseData) {
                if (responseData.hasOwnProperty(scraperKey)) {
                    combinedData = [...combinedData, ...responseData[scraperKey]];
                }
            }

            setData(processData(combinedData));
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }, []);

    // Modified processData function to include sorting
    const processData = (newData) => {
        // Group the data by scraper_id
        const groupedData = newData.reduce((acc, item) => {
            acc[item.scraper_id] = acc[item.scraper_id] || [];
            acc[item.scraper_id].push(item);
            return acc;
        }, {});

        // Combine grouped data and sort by ROI
        return Object.keys(groupedData).reduce((acc, scraperId) => {
            return acc.concat(groupedData[scraperId]);
        }, []).sort((a, b) => b.ROI - a.ROI); // Sorting by ROI in descending order
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 600000); // Refresh every 10 minutes
        return () => clearInterval(interval);
    }, [fetchData]);

    const columns = React.useMemo(
        () => [
            { Header: 'Match Name', accessor: 'Matchname' },
            { Header: 'ROI', accessor: 'ROI' },
            { Header: 'Match Date', accessor: 'Matchdate' }, //
            { Header: 'Bet Type', accessor: 'Bettype' },
            { Header: 'Bookmaker 1', accessor: 'Bookmaker1' },
            { Header: 'Bookmaker 2', accessor: 'Bookmaker2' },
            { Header: 'Player Name', accessor: 'PlayerName' },
            { Header: 'Odds 1', accessor: 'Odds1' }, // Added column for Odds1
            { Header: 'Odds 2', accessor: 'Odds2' }, // Added column for Odds2
            // Note: scraper_id is intentionally left out as it should not be displayed
        ],
        []
    );

    const getBackgroundColor = (value) => {
        switch (true) {
          case value.toLowerCase().includes('player-assists'):
            return '#ece1db';
          case value.toLowerCase().includes('player-shots'):
            return '#d6e5ee';
          case value.toLowerCase().includes('total-shots'):
            return '#f2e1e9';
          case value.toLowerCase().includes('circus'):
            return '#fbe3de';
          case value.toLowerCase().includes('bet365'):
            return '#fbeccc';
          case value.toLowerCase().includes('betcity'):
            return '#d6e5ee';
          default:
            return ''; // You may want to return a default value here
        }
      };

    const tableInstance = useTable({ columns, data });

    return (
        <table {...tableInstance.getTableProps()} className="myTable">
            <thead>
                {tableInstance.headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody {...tableInstance.getTableBodyProps()}>
                {tableInstance.rows.map(row => {
                    tableInstance.prepareRow(row);
                    console.log(row.cells)
                    return (
                        <tr {...row.getRowProps()}>
                            {row.cells.map(cell => (
                                <td {...cell.getCellProps()}> 
                                  <div style={{
                                    padding:'0px 5px',
                                    width:'fit-content',
                                    borderRadius:'3px',
                                    background:getBackgroundColor(cell.value)}}>{cell.render('Cell')}
                                  </div>
                                </td>
                            ))}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

export default DataTable;

