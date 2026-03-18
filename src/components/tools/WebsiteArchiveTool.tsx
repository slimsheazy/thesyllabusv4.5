import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, User, LogOut, LogIn, RotateCcw, Globe, MessageSquare, ExternalLink } from 'lucide-react';
import { useSyllabusStore } from '../../store';
import { useHaptics } from '../../hooks/useHaptics';
import { ToolLayout } from '../shared/ToolLayout';
import { db, auth, loginWithGoogle, logout, handleFirestoreError, OperationType } from '../../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc, where } from 'firebase/firestore';
import { ArchivedSite, Comment } from '../../types';

interface WebsiteArchiveToolProps {
  onBack: () => void;
}

export const WebsiteArchiveTool: React.FC<WebsiteArchiveToolProps> = ({ onBack }) => {
  const { user } = useSyllabusStore();
  const { triggerClick, triggerSuccess } = useHaptics();
  const [archives, setArchives] = useState<ArchivedSite[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArchive, setSelectedArchive] = useState<ArchivedSite | null>(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  // Form states
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'archives'), orderBy('captureDate', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ArchivedSite));
      setArchives(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'archives');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedArchive) {
      setComments([]);
      return;
    }
    const q = query(collection(db, 'comments'), where('archiveId', '==', selectedArchive.id), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
      setComments(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'comments');
    });
    return () => unsubscribe();
  }, [selectedArchive]);

  const handleSubmitArchive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newUrl || !newTitle || !newDesc) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'archives'), {
        url: newUrl,
        title: newTitle,
        description: newDesc,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        captureDate: new Date().toISOString(),
        status: 'complete',
        tags: [],
        size: 'N/A'
      });
      setNewUrl('');
      setNewTitle('');
      setNewDesc('');
      setShowSubmitForm(false);
      triggerSuccess();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'archives');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedArchive || !newComment.trim()) return;

    try {
      await addDoc(collection(db, 'comments'), {
        archiveId: selectedArchive.id,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhoto: user.photoURL || undefined,
        text: newComment,
        createdAt: new Date().toISOString()
      });
      setNewComment('');
      triggerSuccess();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'comments');
    }
  };

  const handleDeleteArchive = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'archives', id));
      if (selectedArchive?.id === id) setSelectedArchive(null);
      triggerClick();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `archives/${id}`);
    }
  };

  const filteredArchives = archives.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ToolLayout
      title="Website Archive"
      subtitle="A collective repository of digital artifacts"
      onBack={onBack}
      tooltipTitle="The Digital Repository"
      tooltipContent="Submit and discuss websites that resonate with the collective syllabus. A living record of the web."
    >
      <div className="w-full flex flex-col gap-8 pb-32">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-archive-line pb-8">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
            <input 
              type="text"
              placeholder="Search the repository..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="archive-input !pl-12"
            />
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            {user ? (
              <>
                <button 
                  onClick={() => setShowSubmitForm(!showSubmitForm)}
                  className="archive-button flex-1 md:flex-none flex items-center justify-center gap-2"
                >
                  <span>+</span> Submit Artifact
                </button>
                <div className="flex items-center gap-3 px-4 py-2 bg-archive-ink/5 rounded-archive border border-archive-line">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="w-4 h-4 opacity-40" />
                  )}
                  <span className="text-[10px] font-mono uppercase tracking-widest hidden sm:inline">{user.displayName}</span>
                  <button onClick={() => logout()} className="opacity-40 hover:opacity-100 transition-opacity" title="Sign Out">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
            <button 
                onClick={() => loginWithGoogle()}
                className="archive-button flex-1 md:flex-none flex items-center justify-center gap-2 bg-archive-ink text-archive-bg"
              >
                <LogIn className="w-4 h-4" /> Sign in to Submit
              </button>
            )}
          </div>
        </div>

        {/* Submit Form */}
        <AnimatePresence>
          {showSubmitForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <form onSubmit={handleSubmitArchive} className="archive-card p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="archive-form-group">
                    <label className="archive-label">Artifact URL</label>
                    <input 
                      required
                      type="url"
                      placeholder="https://example.com"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      className="archive-input"
                    />
                  </div>
                  <div className="archive-form-group">
                    <label className="archive-label">Artifact Title</label>
                    <input 
                      required
                      type="text"
                      placeholder="The Title of the Work"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="archive-input"
                    />
                  </div>
                </div>
                <div className="archive-form-group">
                  <label className="archive-label">Description & Context</label>
                  <textarea 
                    required
                    placeholder="Why does this artifact belong in the syllabus?"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="archive-input min-h-[100px]"
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button type="button" onClick={() => setShowSubmitForm(false)} className="text-[10px] font-mono uppercase opacity-40">Cancel</button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="archive-button bg-archive-ink text-archive-bg flex items-center gap-2"
                  >
                    {isSubmitting ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                    Archive Artifact
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content: List & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* List */}
          <div className="space-y-6">
            <h3 className="archive-label flex items-center gap-2">
              <Globe className="w-4 h-4" /> Recent Submissions
            </h3>
            <div className="space-y-4">
              {filteredArchives.length === 0 ? (
                <div className="py-20 text-center opacity-20 italic font-serif">
                  No artifacts found in this sector of the archive.
                </div>
              ) : (
                filteredArchives.map((archive) => (
                  <motion.div
                    key={archive.id}
                    layoutId={archive.id}
                    onClick={() => { setSelectedArchive(archive); triggerClick(); }}
                    className={`archive-card p-6 cursor-pointer transition-all hover:border-archive-accent-secondary group ${selectedArchive?.id === archive.id ? 'border-archive-accent-secondary bg-archive-ink/5' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-serif italic text-xl group-hover:text-archive-accent-secondary transition-colors">{archive.title}</h4>
                      <span className="text-[9px] font-mono opacity-30 uppercase">{new Date(archive.captureDate).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm opacity-60 line-clamp-2 mb-4 font-serif italic">{archive.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono opacity-40 uppercase tracking-widest">By {archive.userName}</span>
                      <div className="flex items-center gap-3 opacity-40">
                        <MessageSquare className="w-3 h-3" />
                        <span className="text-[10px] font-mono">View Discussion</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Details & Discussion */}
          <div className="lg:sticky lg:top-8 h-fit">
            <AnimatePresence mode="wait">
              {selectedArchive ? (
                <motion.div
                  key={selectedArchive.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="archive-card p-8 space-y-8"
                >
                  <div className="space-y-4 border-b border-archive-line pb-8">
                    <div className="flex justify-between items-start">
                      <h2 className="font-serif italic text-3xl">{selectedArchive.title}</h2>
                      {user?.uid === selectedArchive.userId && (
                        <button onClick={() => handleDeleteArchive(selectedArchive.id)} className="text-red-500/20 hover:text-red-500 transition-colors text-xs uppercase font-mono tracking-widest">
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="font-serif italic text-lg opacity-80 leading-relaxed">{selectedArchive.description}</p>
                    <a 
                      href={selectedArchive.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-archive-accent-secondary hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" /> Visit Artifact: {selectedArchive.url}
                    </a>
                  </div>

                  {/* Discussion Section */}
                  <div className="space-y-6">
                    <h3 className="archive-label flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" /> Discussion
                    </h3>
                    
                    <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {comments.length === 0 ? (
                        <p className="text-sm italic opacity-30 py-4">No discourse has been recorded for this artifact yet.</p>
                      ) : (
                        comments.map((comment) => (
                          <div key={comment.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {comment.userPhoto ? (
                                  <img src={comment.userPhoto} alt={comment.userName} className="w-4 h-4 rounded-full" referrerPolicy="no-referrer" />
                                ) : (
                                <User className="w-3 h-3 opacity-40" />
                                )}
                                <span className="text-[10px] font-mono uppercase tracking-widest opacity-60">{comment.userName}</span>
                              </div>
                              <span className="text-[8px] font-mono opacity-30">{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm font-serif italic bg-archive-ink/5 p-4 rounded-archive border border-archive-line/10">
                              {comment.text}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Comment */}
                    {user ? (
                      <form onSubmit={handleSubmitComment} className="relative">
                        <textarea 
                          placeholder="Contribute to the discourse..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="archive-input !pr-12 min-h-[80px]"
                        />
                        <button 
                          type="submit"
                          disabled={!newComment.trim()}
                          className="absolute right-3 bottom-3 p-2 bg-archive-ink text-archive-bg rounded-archive hover:bg-archive-accent-secondary transition-colors disabled:opacity-20 text-xs font-mono uppercase tracking-widest"
                        >
                          Send
                        </button>
                      </form>
                    ) : (
                      <div className="p-6 border border-dashed border-archive-line text-center">
                        <p className="text-[10px] font-mono uppercase tracking-widest opacity-40 mb-4">Sign in to join the discussion</p>
                        <button onClick={() => loginWithGoogle()} className="archive-button text-[10px]">Sign In</button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-40 opacity-[0.03] select-none pointer-events-none">
                  <Globe className="w-32 h-32" />
                  <p className="handwritten text-4xl uppercase tracking-[0.4em] mt-8">Select an Artifact</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};
