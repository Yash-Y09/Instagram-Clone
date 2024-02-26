import React, { useState, useEffect, useContext } from 'react'
import { UserContext } from '../../App'
import {Link} from 'react-router-dom'

const Home = () => {
    const [data, setData] = useState([])
    const { state, dispatch } = useContext(UserContext)
    useEffect(() => {
        fetch('/allpost', {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        }).then(res => res.json())
            .then(result => {
                console.log(result)
                setData(result.posts)
            })
    }, [])

    const likePost = (id) => {
        fetch('/like', {
            method: "PUT", // Change to PUT method
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({
                postId: id
            })
        }).then(res => res.json())
            .then(result => {
                // console.log(result)
                const newData = data.map(item => {
                    if (item._id == result._id) {
                        return result
                    } else {
                        return item
                    }
                })
                setData(newData)
            }).catch(err => {
                console.log(err)
            })
    }

    const unlikePost = (id) => {
        fetch('/unlike', {
            method: "PUT", // Change to DELETE method
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({
                postId: id,
            })
        }).then(res => res.json())
            .then(result => {
                // console.log(result)
                const newData = data.map(item => {
                    if (item._id == result._id) {
                        return result
                    } else {
                        return item
                    }
                })
                setData(newData)
            }).catch(err => {
                console.log(err)
            })
    }

    const makeComment = (text, postId) => {
        fetch('/comment', {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt"),
            },
            body: JSON.stringify({
                postId: postId,
                text: text
            })
        }).then(res => res.json())
            .then(result => {
                console.log(result)
                const newData = data.map(item => {
                    if (item._id == result._id) {
                        return result
                    } else {
                        return item
                    }

                })
                setData(newData)
            }).catch(err => {
                console.log(err)
            })
    }

    // const deletePost = (postid)=>{
    //     fetch(`/deletepost/${postid}`,{
    //         method:"delete",
    //         headers:{
    //             Authorization: "Bearer " + localStorage.getItem("jwt")
    //         }
    //     }).then(res=>res.json())
    //     .then(result=>{
    //         console.log(result)
    //         const newData = data.filter(item=>{
    //             return item._id !== result._id
    //         })
    //         setData(newData)
    //     })
    // }

    const deletePost = (postid) => {
        fetch(`/deletepost/${postid}`, {
            method: "delete",
            headers: {
                Authorization: "Bearer " + localStorage.getItem("jwt")
            }
        }).then(res => res.json())
            .then(result => {
                console.log(result)
                const newData = data.filter(item => {
                    return item._id !== postid
                })
                setData(newData)
            })
    }

    const deleteComment = (postId, commentId) => {
        fetch(`/deletecomment/${postId}/${commentId}`, {
            method: 'DELETE',
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt"),
            },
        }).then(res => res.json())
            .then(result => {
                console.log(result);
                const newData = data.map(item => {
                    if (item._id === postId) {
                        // Update comments for the specific post
                        item.comments = item.comments.filter(comment => comment._id !== commentId);
                    }
                    return item;
                });
                setData(newData);
            }).catch(err => {
                console.log(err);
            });
    };


    return (
        <div className="home">
            {
                data.map(item => {
                    return (
                        <div className="card home-card" key={item._id}>
                            <h5><Link to={item.postedBy._id !== state._id?"/profile/"+item.postedBy._id : "/profile"} >{item.postedBy.name} </Link>{item.postedBy._id == state._id && <i className="material-icons" style={{ float: "right", color: "red",cursor: 'pointer' }} onClick={() => deletePost(item._id)}>delete</i>} </h5>
                            <div className="card-image">
                                <img src={item.photo} />
                            </div>
                            <div className="card-content">
                                <i className="material-icons" style={{ color: "red" }}>favorite</i>
                                {item.likes.includes(state._id) ? <i className="material-icons"  onClick={() => { unlikePost(item._id) }}>thumb_down</i> : <i className="material-icons" onClick={() => { likePost(item._id) }}>thumb_up</i>}


                                <h6>{item.likes.length} likes</h6>
                                <h6>{item.title}</h6>
                                <p>{item.body}</p>
                                {
                                    item.comments.map(record => (
                                        <div key={record._id} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                                            <span style={{ fontWeight: "500", marginRight: '8px' }}>{record.postedBy.name}</span>
                                            <p style={{ margin: '0', flexGrow: '1' }}>{record.text}</p>
                                            {record.postedBy._id === state._id && (
                                                <i className="material-icons" style={{ color: "red", cursor: 'pointer' }} onClick={() => deleteComment(item._id, record._id)}>
                                                    delete
                                                </i>
                                            )}
                                        </div>
                                    ))
                                }
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    makeComment(e.target[0].value, item._id);
                                    e.target[0].value = ''; // Clear the input field after submitting the comment
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                        <input type="text" placeholder="Add a comment" style={{ flexGrow: '1', marginRight: '8px' }} />
                                        <button type="submit" className="material-icons" style={{ color: "#1976D2", cursor: 'pointer' }}>
                                            send
                                        </button>
                                    </div>
                                </form>

                            </div>
                        </div>
                    )
                })
            }


        </div>
    )
}

export default Home