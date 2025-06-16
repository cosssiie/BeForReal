import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function AdminPage() {
    const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'users', 'comments'
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    // Функція завантаження репортів за типом
    const fetchReports = (type) => {
        setLoading(true);
        axios.get(`/api/reports/${type}`)
            .then(res => {
                setReports(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setReports([]);
                setLoading(false);
            });
    };

    // Завантажуємо репорти при зміні вкладки
    useEffect(() => {
        fetchReports(activeTab);
    }, [activeTab]);

    // Відображення таблиці для кожного типу репортів
    const renderTable = () => {
        if (reports.length === 0) return <p>No reports</p>;

        switch (activeTab) {
            case 'posts':
                return (
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>Post ID</th>
                                <th>Reason</th>
                                <th>Reporting User</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report, i) => (
                                <tr key={i}>
                                    <td><Link to={`/posts/${report.post_id}`}>{report.post_id}</Link></td>
                                    <td>{report.reason}</td>
                                    <td><Link to={`/profile/${report.reporter_id}`}>{report.reporter_username}</Link></td>
                                    <td>{new Date(report.date).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'users':
                return (
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Reason</th>
                                <th>Reporting User</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report, i) => (
                                <tr key={i}>
                                    <td><Link to={`/profile/${report.reported_user_id}`}>{report.reported_username}</Link></td>
                                    <td>{report.reason}</td>
                                    <td><Link to={`/profile/${report.reporter_id}`}>{report.reporter_username}</Link></td>
                                    <td>{new Date(report.date).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'comments':
                return (
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>Comment ID</th>
                                <th>Reason</th>
                                <th>Reporting User</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report, i) => (
                                <tr key={i}>
                                    <td><Link to={`/comment/${report.comment_id}`}>{report.comment_id}</Link></td>
                                    <td>{report.reason}</td>
                                    <td><Link to={`/profile/${report.reporter_id}`}>{report.reporter_username}</Link></td>
                                    <td>{new Date(report.date).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            default:
                return null;
        }
    };


    if (loading) {
        return <div className="loading">Loading reports...</div>;
    }

    return (
        <div className="admin-container">
            <h2>Reports</h2>

            <div className="tabs">
                <button
                    className={activeTab === 'posts' ? 'active' : ''}
                    onClick={() => setActiveTab('posts')}
                >
                    Post Reports
                </button>
                <button
                    className={activeTab === 'users' ? 'active' : ''}
                    onClick={() => setActiveTab('users')}
                >
                    User Reports
                </button>
                <button
                    className={activeTab === 'comments' ? 'active' : ''}
                    onClick={() => setActiveTab('comments')}
                >
                    Comment Reports
                </button>
                <style>{`
                .sidebar-container-filter {
                    display: none;
                }
            `}</style>
            </div>

            {renderTable()}
        </div>
    );
}

export default AdminPage;
