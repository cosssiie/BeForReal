import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';


function AdminPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/reports')
            .then(res => {
                setReports(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Завантаження...</p>;

    return (
        <div className="admin-container">
            <h2>Скарги на пости</h2>
            {reports.length === 0 ? (
                <p>Немає скарг</p>
            ) : (
                <table className="report-table">
                    <thead>
                        <tr>
                            <th>ID Поста</th>
                            <th>Причина</th>
                            <th>Користувач</th>
                            <th>Дата</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map((report, index) => (
                            <tr key={index}>
                                <td>
                                    <Link to={`/posts/${report.post_id}`}>{report.post_id}</Link>
                                </td>
                                <td>{report.reason}</td>
                                <td>
                                    <Link to={`/profile/${report.reporter_id}`}>{report.reporter_username}</Link>
                                </td>
                                <td>{new Date(report.date).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>

                </table>
            )}
            <style>{`
                .sidebar-container-filter {
                    display: none;
                }
            `}</style>
        </div>
    );
}

export default AdminPage;
