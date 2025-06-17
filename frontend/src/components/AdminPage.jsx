import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function AdminPage() {
    const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'users', 'comments'
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        fetchReports(activeTab);
    }, [activeTab]);

    const renderTable = () => {
        if (reports.length === 0) return <p className="no-reports">No reports to display</p>;

        switch (activeTab) {
            case 'posts':
                return (
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>Post</th>
                                <th>Reason</th>
                                <th>Reported by</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report, i) => (
                                <tr key={i}>
                                    <td><Link to={`/posts/${report.post_id}`} className="report-link">#{report.post_id}</Link></td>
                                    <td>{report.reason}</td>
                                    <td><Link to={`/profile/${report.reporter_id}`} className="report-link">{report.reporter_username}</Link></td>
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
                                <th>User</th>
                                <th>Reason</th>
                                <th>Reported by</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report, i) => (
                                <tr key={i}>
                                    <td><Link to={`/profile/${report.reported_user_id}`} className="report-link">{report.reported_username}</Link></td>
                                    <td>{report.reason}</td>
                                    <td><Link to={`/profile/${report.reporter_id}`} className="report-link">{report.reporter_username}</Link></td>
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
                                <th>Comment</th>
                                <th>Reason</th>
                                <th>Reported by</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report, i) => (
                                <tr key={i}>
                                    <td><Link to={`/comment/${report.comment_id}`} className="report-link">#{report.comment_id}</Link></td>
                                    <td>{report.reason}</td>
                                    <td><Link to={`/profile/${report.reporter_id}`} className="report-link">{report.reporter_username}</Link></td>
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
            <h2 className="admin-title">Moderation Dashboard</h2>

            <div className="tabs">
                <button
                    className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('posts')}
                >
                    Post Reports
                </button>
                <button
                    className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    User Reports
                </button>
                <button
                    className={`tab-button ${activeTab === 'comments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('comments')}
                >
                    Comment Reports
                </button>
            </div>

            {renderTable()}
        </div>
    );
}

export default AdminPage;